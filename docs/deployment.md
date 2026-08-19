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

## 1. 一次构建 + 打包（每次改代码）

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

## 2. 部署到 profile

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

## 3. 验证（不启动）

```powershell
& "D:\working\projects\deepseek-harness-UI\scripts\verify-ide-plugin.ps1"
```

28 项检查，全部 `[OK]` + `ALL PASSED` 才允许重启。覆盖：patch 行、host 可加载
并注册 `IdeService`、client bundle 特征（`ctx.get("remote.ide")`、`priority: -1`、
markdown / KaTeX / 文件图标 / 会话持久化 / 预览开关）、版本号、无真实 core 包、
junction ≥ 190、以及近期修复回归项（CSS 转义→Unicode 解码、语言 ID 扩展名展开、
tsconfig.json 走 json 图标、20px 图标）。

## 4. 重启生效

- **Host 面 / 版本变更**：必须完全重启 dsh web（patch 行在启动时组合）。
  若 3080 被残留进程占用：`Get-NetTCPConnection -LocalPort 3080` 找到 PID 后
  `Stop-Process`，再 `npx @deepseek-ai/dsh web --port 3080`（或你的启动方式）。
- **Client 面改动**：刷新浏览器页面即可（`client.js` 静态服务），
  无需重启进程。

## 5. 验证点

| # | 验证点 | 预期 |
|---|---|---|
| 1 | 左侧栏 | logo + 活动栏（资源管理器→搜索→源代码管理→会话管理）+ 内容区 |
| 2 | 资源管理器 | 目录树可展开、隐藏文件开关、**.ts/.js/.json/.md/.py 显示各自的彩色图标（20px）**；git 仓库内文件/目录显示状态点（橙=已修改、灰=未跟踪、绿=已暂存、红=冲突），忽略项半透明 |
| 3 | 搜索 | 关键词出结果，点击跳预览 |
| 4 | 源代码管理 | 分支 + 三组变更，stage/unstage/diff/commit |
| 5 | 会话管理 | 原生对齐的会话/项目行；展开状态刷新后保留 |
| 6 | 编辑器 | 打开 `.md` 后中栏「编辑器」标签页，默认预览模式渲染 GFM 表格 / KaTeX |
| 7 | 控制台 | F12 无 `slot already has a registration`、无 RPC 报错 |

## 6. 常见问题

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

## 7. 回归注意

- 测试请在**新会话**进行；会话 `fc895164` 历史已损坏，不可复用。
- 会话管理视图的展开状态存 `localStorage`（`dshide.session.expanded.v1`），
  想重置可清该键。
