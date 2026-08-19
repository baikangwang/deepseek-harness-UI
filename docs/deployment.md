# 本地部署与验证（deployment）

> 把 `dsh-ide-ui`（社区非官方插件，单包双面）安装到本地 DSH profile 并验证。
> 适用：DSH web 0.1.0-rc.7+，Node 22.19+ / 24+，Windows（PowerShell）。

## 0. 产物与目标

- 构建产物：`dist/dsh-ide-ui-<version>.tgz`（含嵌入字体的 client bundle，约 290KB）。
- 安装目标：`C:\Users\<你>\.dsh\profiles\web\node_modules\dsh-ide-ui`（**真实目录**）。
- 激活方式：profile `cordis.patch.yml` 单行 `- id: ide-ui / name: 'dsh-ide-ui'`。
- profile `package.json` 依赖：`"dsh-ide-ui": "file:D:/…/dist/dsh-ide-ui-<version>.tgz"`。

> **不要**用 `pnpm add` 直接安装 core 包：DSH 通过
> `healProfilesModuleFallback` 在 `profiles/node_modules/@deepseek-ai` 提供
> junction 镜像（195 个，`autoInstallPeers: false` 是有意为之）。安装本插件的
> peer 依赖（react/react-dom）时注意不要引入真实 core 包。

## 1. 无编译环境安装（离线安装包，目标机一键装）

适用于**没有编译环境**的机器（无 TypeScript / tsdown / pnpm / 源码仓库）。
只需 Windows PowerShell + 已装好的 DSH web（运行 dsh 本身需要 Node.js）。

**离线包**：`dist/dsh-ide-ui-offline-<version>.zip`，内含：

```
├── install-dsh-ide-ui.ps1      # 一键安装脚本（含中文说明，UTF-8 BOM）
├── dsh-ide-ui-<version>.tgz    # 预编译插件（Host + Client 双面）
└── README.md                   # 安装/升级/卸载说明
```

**目标机三步安装**：

```powershell
# 1. 解压 zip 到任意目录
# 2. 在该目录运行（默认装到 ~/.dsh/profiles/web）
powershell -ExecutionPolicy Bypass -File .\install-dsh-ide-ui.ps1
#    其他 profile: -ProfileName myprofile
# 3. 完全重启 dsh web（必须重启进程，刷新不够）
Get-NetTCPConnection -LocalPort 3080 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
npx @deepseek-ai/dsh web --port 3080
```

脚本自动完成：备份旧安装（`.bak-<时间戳>`）→ `tar -xf` 解包 → 复制
`lib/` + `package.json` 到 `node_modules\dsh-ide-ui` → profile 依赖指向 tgz
（`file:`）→ `cordis.patch.yml` 写入激活行（幂等）→ 快速校验
（host `IdeService` / client bundle id / 槽位注册）。升级 = 换新版 zip 再跑一次；
卸载 = 删 `node_modules\dsh-ide-ui` + 注释 patch 行。

**生成离线包**（开发者机器）：

```powershell
# 前提：已 npm pack 出 dist/dsh-ide-ui-<version>.tgz
powershell -ExecutionPolicy Bypass -File scripts\build-offline-package.ps1
# 产出 dist/dsh-ide-ui-offline-<version>.zip
```

> 注意：PowerShell 5.1 按 ANSI 读取无 BOM 的 .ps1 会乱码，build 脚本已强制给
> 安装脚本加 UTF-8 BOM；若手动分发脚本请保持 BOM。

## 2. 一次构建 + 打包（每次改代码）

在仓库根 `D:\working\projects\deepseek-harness-UI`：

```powershell
# 1) 类型检查 + 构建（packages/ide 下）
Push-Location packages/ide
npx tsc --noEmit                      # 必须 0 错误
& .\node_modules\.bin\tsdown.cmd      # 产出 lib/index.js + lib/client.js + lib/invariant.js
Pop-Location

# 2) bump 版本（rc.x → rc.y）
#    编辑 packages/ide/package.json 的 "version"（注意：不要用会写 BOM 的方式保存，
#    ConvertTo-Json 后请用 UTF8Encoding($false) 写回，tsdown 读 package.json 遇 BOM 会崩）

# 3) 打包（npm pack 需要临时 cache）
npm pack --pack-destination D:\working\projects\deepseek-harness-UI\dist `
  --cache D:\working\projects\deepseek-harness-UI\.npm-cache-tmp   # 在 packages/ide 下执行
```

## 3. 部署到 profile

```powershell
$tmp  = "D:\working\projects\deepseek-harness-UI\.tmp-deploy"
$dst  = "C:\Users\wangbaikang\.dsh\profiles\web\node_modules\dsh-ide-ui"
$tgz  = "D:\working\projects\deepseek-harness-UI\dist\dsh-ide-ui-<version>.tgz"

if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
tar -xf $tgz -C $tmp

Remove-Item "$dst\lib" -Recurse -Force; Remove-Item "$dst\package.json" -Force
Copy-Item "$tmp\package\lib" "$dst\lib" -Recurse -Force
Copy-Item "$tmp\package\package.json" "$dst\package.json" -Force
Remove-Item $tmp -Recurse -Force

# 更新 profile 依赖指向新 tgz
$p = "C:\Users\wangbaikang\.dsh\profiles\web\package.json"
$j = Get-Content $p -Raw | ConvertFrom-Json
$j.dependencies.'dsh-ide-ui' = "file:D:/working/projects/deepseek-harness-UI/dist/dsh-ide-ui-<version>.tgz"
[System.IO.File]::WriteAllText($p, ($j | ConvertTo-Json -Depth 20), (New-Object System.Text.UTF8Encoding($false)))
```

## 4. 验证（不启动）

```powershell
& "D:\working\projects\deepseek-harness-UI\scripts\verify-ide-plugin.ps1"
```

30 项检查，全部 `[OK]` + `ALL PASSED` 才允许重启。覆盖：patch 行、host 可加载
并注册 `IdeService`、client bundle 特征（`ctx.get("remote.ide")`、`priority: -1`、
markdown / KaTeX / 文件图标 / 会话持久化 / 预览开关）、版本号、无真实 core 包、
junction ≥ 190、以及近期修复回归项（CSS 转义→Unicode 解码、语言 ID 扩展名展开、
tsconfig.json 走 json 图标、20px 图标）。

## 5. 重启生效

- **Host 面 / 版本变更**：必须完全重启 dsh web（patch 行在启动时组合）。
  若 3080 被残留进程占用：`Get-NetTCPConnection -LocalPort 3080` 找到 PID 后
  `Stop-Process`，再 `npx @deepseek-ai/dsh web --port 3080`（或你的启动方式）。
- **Client 面改动**：刷新浏览器页面即可（`client.js` 静态服务），
  无需重启进程。

## 6. 验证点

| # | 验证点 | 预期 |
|---|---|---|
| 1 | 左侧栏 | logo + 活动栏（资源管理器→搜索→源代码管理→会话管理）+ 内容区 |
| 2 | 资源管理器 | 目录树可展开、隐藏文件开关、**.ts/.js/.json/.md/.py 显示各自的彩色图标（20px）**；git 仓库内文件/目录显示状态点（橙=已修改、灰=未跟踪、绿=已暂存、红=冲突），忽略项半透明 |
| 3 | 搜索 | 关键词出结果，点击跳预览 |
| 4 | 源代码管理 | 分支 + 三组变更，stage/unstage/diff/commit |
| 5 | 会话管理 | 原生对齐的会话/项目行；展开状态刷新后保留 |
| 6 | 编辑器 | 打开 `.md` 后中栏「编辑器」标签页，默认预览模式渲染 GFM 表格 / KaTeX |
| 7 | 控制台 | F12 无 `slot already has a registration`、无 RPC 报错 |

## 7. 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| `Unexpected token '\uFEFF' … not valid JSON`（tsdown 崩） | `package.json` 被带 BOM 保存。用 `UTF8Encoding($false)` 重写。 |
| `EADDRINUSE 127.0.0.1:3080` | 3080 被残留 node 进程占用，先杀再启。 |
| 图标显示字面 `\E0??` | 旧版 bug（CSS 转义未解码）。更新到 rc.16+ 并刷新。 |
| 所有文件同一图标 | 旧版生成脚本把映射全写成 `_`。更新到 rc.17+。 |
| 常见语言仍是默认图标 | 语言 ID 未展开成扩展名。更新到 rc.18+。 |
| 装了新 tgz 但行为没变 | 确认 profile `node_modules/dsh-ide-ui` 的 `package.json` 版本号已是新版；浏览器半强制刷新（Ctrl+F5）。 |
| `Insufficient tool messages following tool_calls` | 历史会话被污染（重复 core 包实例导致）。**不要复用旧会话测试**，新建会话。 |
| `slot "sidebar.workspaces" already has a registration at priority 0` | client bundle 缺 `priority: -1`，确认是最新构建。 |

## 8. 自动发布（CI/CD，GitHub Actions）

仓库内置 `.github/workflows/release.yml`，**打 tag 即自动发布**，无需在发布机上
做任何构建。完整方案（流程、配置、踩坑记录、经验教训）见
[`docs/cicd.md`](cicd.md)。快速上手：

```powershell
# 1. 本地 bump 版本并提交
#    （改 packages/ide/package.json 的 version，如 0.1.0-rc.20）
# 2. 打 tag（必须 v 前缀，且与 package.json version 一致）
git tag v0.1.0-rc.20
git push origin v0.1.0-rc.20
```

CI（ubuntu，pnpm 9 + Node 22）自动执行：

1. `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm build`（tsdown）；
2. **tag 与 package.json 版本一致性校验**（不一致直接失败）；
3. `npm pack` → `dist/dsh-ide-ui-<version>.tgz`；
4. `scripts/build-offline-package.ps1`（pwsh）→ `dist/dsh-ide-ui-offline-<version>.zip`；
5. 创建 GitHub Release 并挂载两个产物（已存在则更新覆盖）；
6. **可选 npm publish**：在仓库 Settings → Secrets and variables → Actions
   配置 `NPM_TOKEN`（npm registry 的自动化 token，需对 `dsh-ide-ui` 包名有
   发布权限）后自动执行；未配置则跳过，不影响 Release。

目标机从 Release 页面下载 `-offline-<version>.zip` 即是最新安装包。

## 9. 回归注意

- 测试请在**新会话**进行；会话 `fc895164` 历史已损坏，不可复用。
- 会话管理视图的展开状态存 `localStorage`（`dshide.session.expanded.v1`），
  想重置可清该键。
