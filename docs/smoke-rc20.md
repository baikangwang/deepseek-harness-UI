# dsh-ide-ui 0.1.0-rc.20 真机冒烟步骤（含回滚）

> 目标：把 rc.20（DSH rc.8 基线）装进真实 profile，逐项验证 rc.8 新特性与老特性回归，
> 出问题时**可一键回滚到 rc.19**。适用于 Windows + PowerShell + DSH web。
> 本文档假设 profile 为 `web`、端口 3080（按你的实际启动方式调整）。
>
> **冒烟记录（2026-08-21）**：
> - ✅ 已自动化验证：tgz 打包、快照、安装（备份 `.bak-20260821122258`）、
>   `verify-ide-plugin.ps1` **33 项 ALL PASSED**、真实 rc.8 dsh 启动（3080）、
>   入口页 `__DSH_BOOT__` 含 `dsh-ide-ui`、静态服务的
>   `/plugins/dsh-ide-ui/client.js` 为 rc.20 新 bundle（5 项新特性字符串全在）。
> - ⏳ 待浏览器验证：§6.1 老特性回归 + §6.2 N1–N11（打开 http://127.0.0.1:3080）。

---

## 0. 前提

- 已按 [deployment.md](deployment.md) 部署过 **rc.19** 且当前正常（回滚锚点）。
- Node.js 24 + PowerShell 5.1+；`tar` 可用（Win10 1803+ 自带）。
- **保留 rc.19 的 tgz 是回滚的关键**（`client.js` 是 gitignore 的构建产物，
  仓库里没有旧版可重建）。

---

## 1. 准备：构建 + 打包 rc.20

在仓库 `D:\working\projects\deepseek-harness-UI`（**先确认当前版本已是 rc.20**）：

```powershell
# 1) 版本确认
(Get-Content packages\ide\package.json -Raw | ConvertFrom-Json).version   # 应为 0.1.0-rc.20

# 2) 类型检查 + 构建
Push-Location packages\ide
& .\node_modules\.bin\tsc.cmd --noEmit          # 必须 0 错误
& .\node_modules\.bin\tsdown.cmd                # 产出 lib/index.js + lib/client.js + lib/invariant.js
Pop-Location

# 3) 打包 tgz（npm pack 是本地操作，无需 registry）
$dist = "D:\working\projects\deepseek-harness-UI\dist"
New-Item -ItemType Directory -Path $dist -Force | Out-Null
Push-Location packages\ide
npm pack --pack-destination $dist --cache "D:\working\projects\deepseek-harness-UI\.npm-cache-tmp"
Pop-Location
Get-Item "$dist\dsh-ide-ui-0.1.0-rc.20.tgz"    # 确认存在

# 4) （可选）离线安装包
powershell -ExecutionPolicy Bypass -File scripts\build-offline-package.ps1
# 产出 dist\dsh-ide-ui-offline-0.1.0-rc.20.zip
```

**产出**：`dist\dsh-ide-ui-0.1.0-rc.20.tgz`（约 1.3MB，含嵌入字体的 client bundle）。

---

## 2. 安装前快照（回滚锚点，必做）

把"当前正常状态"完整记下来，任何一步出错都能回到这里：

```powershell
$profile = "$env:USERPROFILE\.dsh\profiles\web"

# a) 记录当前安装版本（应为 0.1.0-rc.19）
(Get-Content "$profile\node_modules\dsh-ide-ui\package.json" -Raw | ConvertFrom-Json).version

# b) 保存 profile 的依赖与 patch 行现状
Copy-Item "$profile\package.json" "$profile\package.json.pre-rc20.bak" -Force
Copy-Item "$profile\cordis.patch.yml" "$profile\cordis.patch.yml.pre-rc20.bak" -Force

# c) 把现有 dsh-ide-ui 目录整体备份（冗余保险；安装器也会自动 .bak-<时间戳>）
if (Test-Path "$profile\node_modules\dsh-ide-ui") {
  Remove-Item "$profile\node_modules\dsh-ide-ui.manual-bak" -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item "$profile\node_modules\dsh-ide-ui" "$profile\node_modules\dsh-ide-ui.manual-bak" -Recurse -Force
}

# d) 确认旧 tgz 还在（回滚最稳路径）
Get-ChildItem "$env:USERPROFILE\Downloads","D:\working\projects\deepseek-harness-UI\dist" -Filter "dsh-ide-ui-0.1.0-rc.19.tgz" -ErrorAction SilentlyContinue | Select-Object FullName
#   若没有：从 git 重建旧版（见 §7 兜底）
```

> 快照后先跑一次基线验证，确保"回滚态 = 可验证态"：
> `& "D:\working\projects\deepseek-harness-UI\scripts\verify-ide-plugin.ps1"` → 应 `ALL PASSED`。

---

## 3. 安装 rc.20

**推荐：离线安装器**（自动备份旧安装 → 解包 → 更新依赖 → 写 patch 行 → 快速校验）：

```powershell
# 方式 A：离线 zip 已生成
Expand-Archive dist\dsh-ide-ui-offline-0.1.0-rc.20.zip -DestinationPath .\.tmp-offline -Force
cd .\.tmp-offline
powershell -ExecutionPolicy Bypass -File .\install-dsh-ide-ui.ps1

# 方式 B：直接用 tgz（脚本在仓库里，-PackageTgz 指定 rc.20）
powershell -ExecutionPolicy Bypass -File scripts\offline\install-dsh-ide-ui.ps1 `
  -PackageTgz "D:\working\projects\deepseek-harness-UI\dist\dsh-ide-ui-0.1.0-rc.20.tgz"
```

安装器结束时打印 `[OK] dsh-ide-ui 0.1.0-rc.20 已安装`。此时旧安装已被移到
`node_modules\dsh-ide-ui.bak-<时间戳>`。

**手动方式（可选）**：按 [deployment.md §3](deployment.md) 的 `tar -xf` 流程，注意
`Remove-Item "$dst\lib"` 前先确认 `$dst` 存在且是旧版目录。

---

## 4. 重启前验证（不启动）

```powershell
& "D:\working\projects\deepseek-harness-UI\scripts\verify-ide-plugin.ps1"
```

必须全部 `[OK]` + `ALL PASSED`。重点看新增的 5 项 rc.8 断言：

- `feature: session search degradation (rc.8)` — bundle 含提示条与降级逻辑
- `feature: settings card (rc.8)` — 含 `settings.plugin.item` 与「IDE 设置」
- `feature: remote event refresh (rc.8)` — 含 `credentials/updated`
- `feature: home abbreviation (rc.8)` — 含 `abbreviateHomePath`
- `feature: copy @ reference (rc.8)` — 含复制动作
- `version is rc.20`

任一项 `[FAIL]`：说明装的是旧构建或解包不完整 → **不要重启**，直接走 §7 回滚。

> 说明：rc.20 的 Host 半新增了 `@deepseek-ai/dsh-settings` 与 `@deepseek-ai/schemastery`
> 两个 external 依赖，由 profile 的 fallback junction 镜像提供（rc.8 官方 settings
> 组件本身依赖它们，镜像里已有）。verify 脚本的 host 加载检查会一并验证这点；
> 若报 `Cannot find package`，先确认 dsh 本体是 rc.8 再回滚。

---

## 5. 重启 dsh web（必须完全重启进程）

Host 面（settings 命名空间注册）与版本变更在启动时组合，**刷新页面不够**：

```powershell
# 1) 找到占用 3080 的进程并结束（按你的实际启动方式）
Get-NetTCPConnection -LocalPort 3080 -ErrorAction SilentlyContinue | Select-Object OwningProcess
Stop-Process -Id <PID> -Force

# 2) 重启
npx @deepseek-ai/dsh web --port 3080
# 或你的启动方式（桌面应用 / 自建脚本）

# 3) 浏览器打开 http://127.0.0.1:3080，硬刷新（Ctrl+F5）
```

> 之后每次只改 client 面：`Ctrl+F5` 即可，不必重启进程。

---

## 6. 冒烟清单

**测试纪律**：全部在**新会话**进行（不要复用旧会话，历史可能被旧版本污染）。
F12 打开控制台，全程无 `slot already has a registration`、无 RPC 报错。

### 6.1 老特性回归（快速过）

| # | 验证点 | 预期 |
|---|---|---|
| 1 | 左侧栏 | logo + 活动栏（资源管理器→搜索→源代码管理→会话管理）+ 内容区，rail 折叠正常 |
| 2 | 资源管理器 | 目录树展开/折叠、git 状态点（橙改/灰未跟踪/绿暂存/红冲突）、忽略项半透明、行 hover 动作齐全 |
| 3 | 工作区内容搜索 | 关键词出结果、点击跳编辑器预览 |
| 4 | 源代码管理 | 分支、三组变更、stage/unstage/diff/commit 全流程 |
| 5 | 编辑器 | `.md` 预览模式渲染 GFM 表格 / KaTeX；源码/预览切换 |
| 6 | 会话管理 | 原生对齐行、展开状态刷新后保留 |

### 6.2 rc.8 新特性（逐项）

| # | 验证点 | 操作 | 预期 |
|---|---|---|---|
| N1 | **会话搜索降级** | 会话管理 → 搜索框输入**标题关键字** | ① 出现按标题/工作区匹配的本地结果；② 若部署默认（内容索引关闭）显示黄色提示条"会话全文搜索不可用（该部署未启用内容索引），仅按标题/工作区匹配。"；③ 输入乱码关键字 → "未找到匹配的会话"（无提示条也算正常，取决于部署是否开启 `openAt: first-search`） |
| N2 | **设置卡片** | 设置 → 插件配置（Plugins）标签 | 出现「IDE 设置」卡片：搜索/编辑器/资源管理器/源代码管理四组 |
| N3 | **设置即时生效（编辑器）** | 卡片改「字号」为 16 → 保存 | 编辑器源码/预览立即变 16px；勾掉「显示行号」→ 行号消失 |
| N4 | **设置即时生效（搜索排除）** | 卡片「排除目录」加一行 `logs` → 保存 → 在含 `logs/` 的目录下搜索 | 结果不含 `logs` 目录内容（对比保存前） |
| N5 | **设置持久化** | 改完设置后刷新页面 | 设置仍在（写入 `settings.yaml`）；卡片「重置为默认」恢复默认并即时生效 |
| N6 | **SCM 自动刷新（定时）** | 卡片把「自动刷新间隔」调成 `5000` → 保存 → 在工作区里新建/改一个文件 | 无需手动点刷新，SCM 状态 5 秒内自动更新 |
| N7 | **SCM 凭据事件刷新** | 在设置里更新任一凭据（如 web_search 的 key）或执行一次会触发 `credentials/updated` 的操作 | SCM 视图自动刷新（无需手动刷新按钮） |
| N8 | **`~` 路径缩写** | 新建工作区到 `%USERPROFILE%` 下（如 `C:\Users\你\demo-ide`）→ 资源管理器 hover 目录行 title | 显示 `~/demo-ide`；`D:\...` 盘符路径**不**缩写；关掉设置「路径缩写 ~」→ 恢复全路径 |
| N9 | **复制为 @引用（文件）** | 资源管理器 hover 某文件 → 点 `@` 按钮 → 在输入框 Ctrl+V | 输入框出现 `@相对路径`（含空格路径为 `@"路径"`），发送后 agent 用 read 工具读它 |
| N10 | **复制为 @引用（目录/搜索）** | 目录行 hover 点 `@`；搜索结果的匹配行 hover 点 `@` | 目录得到 `@dir/`；搜索结果同样可复制，粘贴正常 |
| N11 | **控制台** | 全程 F12 | 无 `already has a registration`、无 `Cannot find package`、无 RPC 报错 |

### 6.3 备注

- N1 的提示条文案在有内容索引的部署（`openAt: first-search`）不出现——这是**预期**，
  不是缺失。
- N7 若真机不便触发凭据事件，以 N6 的定时刷新 + N2/N3 的设置即时生效作为
  `$on` 通道的间接验证即可（三者共用同一刷新/镜像链路）。
- 会话管理视图展开状态存 `localStorage`（`dshide.session.expanded.v1`），想重置清该键。

---

## 7. 回滚（rc.20 → rc.19）

任一 `[FAIL]`、冒烟发现破坏性回归、或用户要求回退时执行。**核心思想**：
安装器已把旧安装备份在 `.bak-<时间戳>`，恢复它 + 恢复 profile 依赖指向 + 重启。

### 7.1 一键回滚（推荐）

```powershell
$profile = "$env:USERPROFILE\.dsh\profiles\web"
$ErrorActionPreference = 'Stop'

# 1) 停 dsh web（先杀 3080 进程，见 §5）
Get-NetTCPConnection -LocalPort 3080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# 2) 恢复旧安装目录（优先 .bak-<时间戳>，其次 manual-bak，最后旧 tgz）
$dst = "$profile\node_modules\dsh-ide-ui"
$bak = @(Get-ChildItem "$profile\node_modules" -Directory -Filter "dsh-ide-ui.bak-*" -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending)
if ($bak.Count -gt 0) {
  Remove-Item $dst -Recurse -Force -ErrorAction SilentlyContinue
  Move-Item $bak[0].FullName $dst
  Write-Host "已从备份恢复: $($bak[0].Name)"
} elseif (Test-Path "$profile\node_modules\dsh-ide-ui.manual-bak") {
  Remove-Item $dst -Recurse -Force -ErrorAction SilentlyContinue
  Move-Item "$profile\node_modules\dsh-ide-ui.manual-bak" $dst
} elseif (Test-Path "$env:USERPROFILE\Downloads\dsh-ide-ui-0.1.0-rc.19.tgz") {
  # 旧 tgz 手动解包
  Remove-Item $dst -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  tar -xf "$env:USERPROFILE\Downloads\dsh-ide-ui-0.1.0-rc.19.tgz" -C "$profile\node_modules\dsh-ide-ui.tmp"
  Copy-Item "$profile\node_modules\dsh-ide-ui.tmp\package\lib" "$dst\lib" -Recurse -Force
  Copy-Item "$profile\node_modules\dsh-ide-ui.tmp\package\package.json" "$dst\package.json" -Force
  Remove-Item "$profile\node_modules\dsh-ide-ui.tmp" -Recurse -Force
} else {
  throw "找不到 rc.19 备份或 tgz —— 请改用 §7.2 从仓库重建。"
}

# 3) 恢复 profile 依赖指向旧 tgz（回滚安装器改写的 file: 路径）
$pkgFile = "$profile\package.json"
$pkg = Get-Content $pkgFile -Raw | ConvertFrom-Json
$pkg.dependencies.'dsh-ide-ui' = 'file:' + ("$env:USERPROFILE\Downloads\dsh-ide-ui-0.1.0-rc.19.tgz" -replace '\\','/')
[System.IO.File]::WriteAllText($pkgFile, ($pkg | ConvertTo-Json -Depth 20), (New-Object System.Text.UTF8Encoding($false)))

# 4) cordis.patch.yml 无需改动（激活行相同），确认一下
Get-Content "$profile\cordis.patch.yml" | Select-String "dsh-ide-ui"

# 5) 校验版本 + 重启前检查
(Get-Content "$dst\package.json" -Raw | ConvertFrom-Json).version     # 应为 0.1.0-rc.19
& "D:\working\projects\deepseek-harness-UI\scripts\verify-ide-plugin.ps1"
```

> 若回滚前升级过 verify 脚本（版本断言已是 rc.20），回滚后该脚本的
> `version is rc.20` 检查会 FAIL——这是**脚本与新装版本不匹配**，不是安装坏了；
> 此时以 `(Get-Content ...).version` 输出 rc.19 + 其余检查 OK 为准，或临时把脚本断言改回 rc.19。

### 7.2 兜底：连旧 tgz / 备份都没有（从仓库重建 rc.19）

`lib/client.js` 是 gitignore 的，仓库只有 rc.19 的 **tracked** 产物（lib/index.js 等）——
因此必须重建 client.js：

```powershell
# 1) 找出升级前的提交（rc.19 的 package.json version）
cd D:\working\projects\deepseek-harness-UI
git log --oneline -5 -- packages/ide/package.json    # 找 version=0.1.0-rc.19 的提交 HASH
git stash list                                       # 若有未提交改动先处理

# 2) 在该提交上重建 rc.19（分离头即可，别丢当前工作）
git worktree add .\.tmp-rc19 <HASH>
#    注：.tmp-rc19 里的 node_modules 需重装 rc.7 SDK（见升级前锁文件）：
#    corepack pnpm install --frozen-lockfile
Push-Location .\.tmp-rc19\packages\ide
& .\node_modules\.bin\tsc.cmd --noEmit
& .\node_modules\.bin\tsdown.cmd
npm pack --pack-destination "$env:USERPROFILE\Downloads"
Pop-Location

# 3) 用 §7.1 的旧 tgz 分支安装该 tgz
```

> 兜底重建需要网络（pnpm install rc.7 依赖），且仓库 git 需含 rc.19 提交。
> **强烈建议平时就保留每个发布版 tgz**（CI Release 页也会挂载）。

### 7.3 回滚后验证

```powershell
# 重启 dsh web（§5）→ 浏览器硬刷新 → 新会话
# 1) 版本回退：插件已变回 rc.19（设置页不再有「IDE 设置」卡片为预期）
# 2) 老特性抽查：资源管理器 / 搜索 / SCM / 编辑器 / 会话管理 正常
# 3) 控制台无报错
```

---

## 8. 记录

冒烟与回滚结果建议记进 release notes / 本仓库 `docs/deployment.md` 的验证点表，
下次升级复用同一清单。
