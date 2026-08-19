# dsh-ide-ui CI/CD 发布方案

> 从「本地手动打包」升级为「打 tag 即自动发布」。本文记录方案设计、使用方式、
> 上线过程中遇到的问题与修复，以及沉淀的经验教训。

## 1. 方案概览

仓库内置 `.github/workflows/release.yml`（GitHub Actions，ubuntu-latest +
pnpm 11 + Node 22）。**推送 `v<semver>` 格式的 tag 自动触发**，全流程无人值守：

```
push tag v0.1.0-rc.20
  └─ Checkout → Setup pnpm(11) → Setup Node(22, cache:pnpm)
      → pnpm install --frozen-lockfile
      → pnpm typecheck
      → pnpm build            (tsdown 三产物)
      → [校验] tag 版本 == package.json version（不一致直接失败）
      → npm pack → dist/dsh-ide-ui-<ver>.tgz
      → scripts/build-offline-package.ps1 → dist/dsh-ide-ui-offline-<ver>.zip
      → GitHub Release 创建/更新，挂载两个产物
      → [可选] npm publish（配置 NPM_TOKEN 才执行，否则自动跳过）
```

产物：

| 产物 | 用途 |
|---|---|
| `dsh-ide-ui-<ver>.tgz` | 预编译插件包（开发者/`file:` 依赖部署） |
| `dsh-ide-ui-offline-<ver>.zip` | **无编译环境安装包**：解压 → 跑 `install-dsh-ide-ui.ps1` → 重启 dsh web |

## 2. 使用方式

```powershell
# 1) 本地 bump 版本并提交
#    编辑 packages/ide/package.json 的 "version"（如 0.1.0-rc.20）
# 2) 打 tag（必须 v 前缀，且与 package.json 版本一致）
git tag v0.1.0-rc.20
git push origin v0.1.0-rc.20
```

或手动触发（不 bump 版本，用当前版本重新打包）：Actions 页面 → `release` →
**Run workflow**（master 分支，版本号留空）。

tag 与 package.json 版本不一致时 CI 直接失败——防止发布错误版本。

## 3. 可选：npm 发布

当前 npm 发布**刻意关闭**（用户决策：先解决打包，npm 以后再说）。将来要开启：

1. 仓库 Settings → Secrets and variables → Actions 添加 `NPM_TOKEN`
   （npm 账号的 automation token，需对 `dsh-ide-ui` 包名有发布权限；注意包名可能
   已被占用，首次发布前先在 npm 上确认/预留）。
2. 下次打 tag 时，workflow 的 `Publish to npm` 步骤自动执行（有 token 才跑）。

workflow 中的 npm 发布步骤由 job 级 `env.NPM_TOKEN` 门控，未配置即静默跳过，
不影响打包与 Release。

## 4. 上线过程的问题与修复

### 4.1 Actions 页面看不到 workflow

**现象**：推送后 Actions 页面左侧没有 `release` 工作流。

**排查与结论**：先确认文件真的在远程（`git ls-tree origin/master -- .github/workflows/`
能查到、`git show origin/master:.github/workflows/release.yml` 内容正确）。最终
确认是**页面缓存/时序**问题——workflow 文件已在默认分支 master 上，刷新
（Ctrl+F5）后可见。另需注意：**推送普通 commit 不会触发任何运行**（触发条件只有
`push tag` 和手动 `Run workflow`），Actions 页面没有运行记录是正常的，不代表
workflow 没生效。

排查清单：文件在默认分支、Actions 未被仓库禁用
（Settings → Actions → General）、无 `Invalid workflow file` 红色横幅。

### 4.2 Node.js 20 弃用导致 action 报错

**现象**：首次运行报
`Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v4`。

**根因**：GitHub 于 2025-09 弃用跑在 Node 20 上的 action，v4 系列被强制切到
Node 24 运行而失败。

**修复**：升级到使用 Node 24 runner 的版本：

| Action | 旧 | 新 |
|---|---|---|
| `actions/checkout` | `@v4` | `@v5` |
| `actions/setup-node` | `@v4` | `@v5` |
| `pnpm/action-setup` | `@v4` | `@v6` |

**教训**：GitHub 生态有 Node 运行时弃用节奏，action 版本要跟得上；出现
"deprecated / forced to run on" 类报错时先升级 action 大版本。

### 4.3 `ERR_PNPM_OUTDATED_LOCKFILE`：lockfile 陈旧

**现象**：`pnpm install --frozen-lockfile` 失败，提示 pnpm-lock.yaml 与
`packages/ide/package.json` 不匹配，specifiers 缺 `react`、`@types/react`。

**根因**：客户端半合并进 packages/ide 后新增了 react/@types/react 依赖，但
**本地 node_modules 是手工 junction（`healProfilesModuleFallback` 机制），从未跑过
pnpm install**，lockfile 快照一直停留在旧状态。本地 `tsc` 能过（依赖在 junction
里），CI 冷环境 `--frozen-lockfile` 严格比对就暴露了。

**修复**：
1. 用 `corepack pnpm install --lockfile-only` 重新生成 lockfile（只更新 lockfile，
   不动 node_modules，安全）。
2. CI 的 pnpm 版本从 9 对齐到 11（与写 lockfile 的工具一致），避免格式差异。

**教训**：lockfile 是「真相来源」，与 package.json 必须同步；**任何依赖变更后都要
重新生成并提交 lockfile**。本地"能编译"不代表 lockfile 新鲜——特别是用非标准方式
（junction/软链）搭 node_modules 的环境。

### 4.4 CI typecheck 报一堆 TS2307：类型依赖未声明

**现象**：typecheck 阶段报 `Cannot find module '@deepseek-ai/dsh-api-remotes/client'`、
`Property 'remote'/'slots' does not exist on type 'Context'`、`Cannot find module
'mdast' / 'katex' / 'mdast-util-*' / 'micromark-extension-*'`。

**根因**：markdown 工具链（mdast/katex/micromark）和 DSH 类型包
（dsh-api-remotes、dsh-client-ui-slots/sidebar/conversation）**只存在于本地手工
junction 的 node_modules**，从未声明进 package.json。CI 冷环境 `pnpm install`
只装声明的依赖，tsc 解析全部失败。

**修复**：把 type-only 依赖全部显式加入 devDependencies：
- markdown 链：`mdast`、`katex`、`mdast-util-from-markdown/-gfm/-math`、
  `micromark-extension-gfm/-math`、`@types/mdast`（运行时已打进 client.js，
  声明仅为类型检查）
- DSH 类型：`@deepseek-ai/dsh-api-remotes`（Context.remote）、
  `dsh-client-ui-slots`（Context.slots）、`dsh-client-ui-sidebar/-conversation`
  （槽位契约），版本 0.1.0-rc.7
- 重新 `--lockfile-only` 生成 lockfile 后提交

**子坑**：`mdast` 写 `^4.0.0` 解析失败——pnpm 提示最新版是 **3.0.0**（npm 包
`mdast` 并没有 4.x）。版本号要以 registry 为准，不确定时先 `pnpm view <pkg> versions`。

**教训**：**CI 冷环境是唯一真相**。所有 import 的模块必须能在 `pnpm install`
后解析；本地 junction 缓存会掩盖依赖声明缺失，`tsc --noEmit` 本地绿不代表 CI 绿。

## 5. 经验教训汇总

### 5.1 本地环境与 CI 冷环境的差异（最大教训）

本地 node_modules 用手工 junction 搭建（DSH 的 `healProfilesModuleFallback`
设计，`autoInstallPeers: false`），与标准 pnpm 安装完全不同：

- 本地能编译 ≠ lockfile 正确 ≠ CI 能装。
- **每次改动依赖（新增 import 的包、改版本）都要：声明进 package.json →
  `corepack pnpm install --lockfile-only` → 提交 lockfile → 本地 tsc 验证。**
- `pnpm typecheck`/`pnpm build` 的本地/CI 对等性：本地无 pnpm 命令时用
  `corepack pnpm`（随 Node 自带）；`npx pnpm` 在沙箱可能被拒（写入 npm cache 报
  EPERM）。

### 5.2 PowerShell 脚本编码（BOM）

- **PowerShell 5.1 按 ANSI 读无 BOM 的 UTF-8 .ps1，中文注释会乱码并破坏解析**
  （`Unexpected token` / `Missing closing '}'`）。
- 分发/提交给目标机的 .ps1 必须带 UTF-8 BOM；CI 的 pwsh 7 无所谓但兼容 BOM。
- 注意：**用 edit 工具修改 .ps1 会丢 BOM**，改完必须重新加（
  `ReadAllText(UTF8)` + `WriteAllText(UTF8Encoding($true))`）。
- `build-offline-package.ps1` 已内置"复制安装脚本后强制加 BOM"，防止目标机
  PowerShell 5.1 乱码。

### 5.3 GitHub Actions 的 env/secrets 求值时机

- **step 级 `env` 在 step 的 `if` 条件求值时不可见**——`if: env.X != ''` 里引用
  step 自己定义的 env 永远是空 → 步骤永不执行（静默 bug）。
- **`secrets` 不能直接在 `if` 表达式里引用**。
- 正确做法：把 secret 放进 **job 级 env**（`env: { NPM_TOKEN: ${{ secrets.NPM_TOKEN }} }`），
  step 的 `if` 引用 `env.NPM_TOKEN`，step 内直接 `$NPM_TOKEN`。

### 5.4 其它

- **gh CLI 在 runner 预装**，配 `GH_TOKEN: ${{ github.token }}` 即可创建/更新
  Release，无需额外认证。
- Release 已存在时用 `gh release view` 判断 → `upload --clobber` 更新附件，
  幂等可重跑。
- workflow 改动后**旧运行记录不会更新**——看日志前先确认运行对应的 commit 是最新
  推送；排查"还是旧错误"时先核对 commit hash。

## 6. 本地流程 vs CI 流程

| 步骤 | 本地（开发者机） | CI（GitHub Actions） |
|---|---|---|
| 依赖安装 | 手工 junction（不跑 pnpm install） | `pnpm install --frozen-lockfile` |
| 类型检查 | `npx tsc --noEmit`（packages/ide） | `pnpm typecheck`（递归） |
| 构建 | `node_modules/.bin/tsdown.cmd` | `pnpm build`（递归） |
| 打包 | `npm pack --pack-destination dist` | `npm pack`（同参数） |
| 离线包 | `build-offline-package.ps1` | 同脚本（pwsh 7，正斜杠路径兼容） |
| 部署验证 | `verify-ide-plugin.ps1`（30 项，需真实 profile） | 不跑（无 profile 环境） |
| 版本管理 | 手动 bump + 提交 | 校验 tag == package.json |

## 7. 后续改进建议

- **npm 发布**：需要时配置 `NPM_TOKEN` secret 即可，代码零改动。
- **更严格的可复现**：`actions/*@v5` 可改 pin 到 commit SHA（供应链安全），
  代价是升级要手动改。
- **缓存构建**：setup-node 已带 `cache: pnpm`；产物无需缓存（全量构建 < 1 分钟）。
- **Release notes**：目前用 `--generate-notes`，可改为按 commits 自动生成
  changelog。
- **workflow 语法校验**：可加 `mattiasbuelens/workflow-lint` 或在本地用
  js-yaml 预检（本项目用 `node_modules/.pnpm/js-yaml@4.3.1` 校验）。
