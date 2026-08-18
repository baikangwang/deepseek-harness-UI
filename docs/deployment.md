# 本地部署与验证（deployment）

> 目标：把 `dsh-ide-ui` / `dsh-client-ide-ui`（社区非官方插件）安装到本地 DSH profile 并验证功能。
> 适用：`dsh` 0.1.0-rc.7，Node 22.19+ / 24+。

## 0. 前置环境

| 项 | 说明 |
|---|---|
| `dsh` CLI | `npx @deepseek-ai/dsh web`，或把 npx 缓存 `.bin` 加入 PATH 后直接 `dsh` |
| `pnpm` | 若无全局 pnpm，用 `corepack pnpm`；或建 shim（见下） |
| tarball | `dist/dsh-ide-ui-0.1.0-rc.7.tgz`、`dist/dsh-client-ide-ui-0.1.0-rc.7.tgz`、`dist/dsh-ide-ui-bundle-0.1.0-rc.7.tgz` |

> **为什么本地验证不装 bundle**：`dsh-ide-ui-bundle` 的 `dependencies` 指向 `dsh-ide-ui@^0.1.0-rc.7`，未发布到 npm 前 `dsh plugin add` 会在 registry 解析 404。本地验证改为：装两个包 tarball + 手动写 profile patch（效果与 bundle 一致）。

### pnpm shim（无全局 pnpm 时）

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.dsh\dsh-shims" | Out-Null
'@echo off
corepack pnpm %*' | Out-File -Encoding ascii "$env:USERPROFILE\.dsh\dsh-shims\pnpm.cmd"
$env:PATH = "$env:USERPROFILE\.dsh\dsh-shims;$env:PATH"
```

## 1. 安装两个包到 profile

```powershell
$dsh = "C:\Users\wangbaikang\AppData\Local\npm-cache\_npx\<hash>\node_modules\.bin\dsh.cmd"  # 换成你的 npx 缓存路径

& $dsh plugin --profile web add `
  D:\working\projects\deepseek-harness-UI\dist\dsh-ide-ui-0.1.0-rc.7.tgz `
  D:\working\projects\deepseek-harness-UI\dist\dsh-client-ide-ui-0.1.0-rc.7.tgz
```

预期：两个包以 `file:` 依赖装入 `~/.dsh/profiles/web/package.json`；输出两条
`dsh: warning: ... declares no dsh.bundle — installed as a plain dependency`（正常，
无 `dsh.bundle` 的包不自动成为 layer，由下一步手动 patch 激活）。

> 若之前装过旧版本，pnpm 可能报 `Already up to date` 不替换文件——先 remove 再 add：
> `& $dsh plugin --profile web remove dsh-ide-ui` 后重装。

## 2. 补 peer 依赖（必须）

profile 的 pnpm 默认 `autoInstallPeers: false`，peer 依赖不会自动装进 profile 的
`node_modules`。虽然 dsh 的 `~/.dsh/profiles/node_modules` 兜底镜像通常能解析，但
显式声明才稳妥：

```powershell
Push-Location "$env:USERPROFILE\.dsh\profiles\web"
corepack pnpm add "@deepseek-ai/cordis@4.0.1" "@deepseek-ai/dsh-invariants@0.1.0-rc.7" `
  "@deepseek-ai/dsh-typert-protocol@0.1.0-rc.7" "@deepseek-ai/dsh-api-gateway@0.1.0-rc.7" `
  "@deepseek-ai/dsh-api-remotes@0.1.0-rc.7" "@deepseek-ai/dsh-client-runtime@0.1.0-rc.7" "react@18.3.1"
Pop-Location
```

## 3. 写 profile patch 激活插件行

编辑 `~/.dsh/profiles/web/cordis.patch.yml`（把 `[]` 换成）：

```yaml
- insert:
    - id: ide-ui
      name: 'dsh-ide-ui'
    - id: ui-ide
      name: 'dsh-client-ide-ui'
```

行 id 与包名必须与 tarball 的 `package.json`/`exports` 完全一致（`dsh-ide-ui` 提供
`/remote`，`dsh-client-ide-ui` 声明 `dsh.client`），modules 子系统扫描该行即可把
client bundle 纳入浏览器 roster。

## 4. 静态验证组合树（不启动）

```powershell
& $dsh --profile web --dump-config 2>&1 | Select-String -Pattern 'ide-ui|ui-ide|Cannot find|SyntaxError'
```

预期：出现 `- id: ide-ui` / `- id: ui-ide` 两行，无 `Cannot find package` / `SyntaxError`。

## 5. 重启 dsh web 并浏览器验证

**必须完全重启进程**（patch 行在启动时组合，刷新页面不生效）。若有旧实例先结束
（`Get-NetTCPConnection -LocalPort 3080` 找到 PID 后结束），再：

```powershell
& $dsh --profile web
```

浏览器打开 http://127.0.0.1:3080：

| # | 验证点 | 预期 |
|---|---|---|
| 1 | 左侧栏 | logo + 活动栏（资源管理器→搜索→源代码管理→会话管理）+ 内容区 |
| 2 | 资源管理器 | 工作区目录树可展开、隐藏文件开关、只读预览带行号 |
| 3 | 搜索 | 关键词出结果（rg 快路径或回退扫描），点击跳预览 |
| 4 | 源代码管理 | 分支 + 三组变更；在 git 仓库目录操作 stage/unstage/diff |
| 5 | 会话管理 | 会话列表（状态点/标题/工作区/相对时间），点击打开 |
| 6 | 编辑器 | 打开文件后中栏出现「编辑器」标签页（`conversation.view`） |
| 7 | 控制台 | F12 无 `slot "X" is already declared`、无 RPC 报错 |

## 6. 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| `Invalid or unexpected token` at `@Remote(...)` | host 包 `lib/index.js` 残留装饰器语法。已修复：`tsdown.config.ts` 的 transform 插件用 `typescript.transpileModule` 降级（`__esDecorate`）。确认 tarball 为最新（`node --check` 通过、含 `__esDecorate`）。 |
| `No anonymous write access` 无法 push | 配置凭据：`git config credential.helper wincred` + `git config http.proxy http://127.0.0.1:10808`（本地代理），沙箱内需完整访问权限执行 git。 |
| `dsh` 不是内部或外部命令 | dsh 只在 npx 缓存 `.bin`，不在 PATH。用全路径或 `npm i -g @deepseek-ai/dsh@0.1.0-rc.7`。 |
| `EADDRINUSE` | 3080 端口被残留进程占用，先杀旧进程再启动。 |
| 装了新 tarball 但行为没变 | pnpm `Already up to date` 未替换——`dsh plugin remove` 后重装，或删除 profile 里对应 `node_modules` 目录重装。 |

## 7. 打包产物清单

| tarball | 内容 |
|---|---|
| `dsh-ide-ui-0.1.0-rc.7.tgz` | Host 半：`ide` Remote（fs/git/search），Typert 产物已降级装饰器 |
| `dsh-client-ide-ui-0.1.0-rc.7.tgz` | Client 半：侧栏 + 编辑器标签页 |
| `dsh-ide-ui-bundle-0.1.0-rc.7.tgz` | 组合层：`cordis.patch.yml`（发布到 npm 后可直接 `dsh plugin add`） |
