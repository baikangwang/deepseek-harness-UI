# install-dsh-ide-ui.ps1 - offline installer for the prebuilt dsh-ide-ui plugin
#
# For machines WITHOUT a build environment (no TypeScript / tsdown / pnpm):
# the tarball next to this script already contains the compiled plugin
# (lib/index.js host half + lib/client.js browser half). This script:
#   1. backs up any existing dsh-ide-ui install
#   2. unpacks the tarball into ~/.dsh/profiles/<name>/node_modules/dsh-ide-ui
#   3. points the profile dependency at the tarball (file:)
#   4. activates the plugin row in cordis.patch.yml (idempotent)
#   5. runs a quick sanity check
# Requirements: PowerShell 5.1+, Node.js (needed by dsh anyway), tar (built into
# Windows 10 1803+ / Windows 11). NO build toolchain required.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\install-dsh-ide-ui.ps1
#   powershell -ExecutionPolicy Bypass -File .\install-dsh-ide-ui.ps1 -ProfileName myprofile

param(
  [string]$ProfileName = 'web',
  [string]$ProfileDir = '',          # override the full profile path (testing)
  [string]$PackageTgz = '',          # default: newest dsh-ide-ui-*.tgz next to this script
  [switch]$Force                     # replace the existing install instead of backing it up
)
$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- 1. locate the tarball --------------------------------------------------
if (-not $PackageTgz) {
  $candidates = @(Get-ChildItem -Path $here -Filter 'dsh-ide-ui-*.tgz' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending)
  if ($candidates.Count -eq 0) { throw '找不到 dsh-ide-ui-*.tgz —— 请把它与本脚本放在同一目录。' }
  $PackageTgz = $candidates[0].FullName
}
if (-not (Test-Path $PackageTgz)) { throw "找不到 tarball: $PackageTgz" }

# --- 2. resolve the profile -------------------------------------------------
if (-not $ProfileDir) { $ProfileDir = Join-Path $env:USERPROFILE ".dsh\profiles\$ProfileName" }
if (-not (Test-Path $ProfileDir)) { throw "profile 不存在: $ProfileDir （请用 -ProfileName 指定，例如 -ProfileName web）" }

Write-Host "==> 目标 profile: $ProfileDir"
Write-Host "==> 安装包: $PackageTgz"

# --- 3. backup / replace the existing install -------------------------------
$dst = Join-Path $ProfileDir 'node_modules\dsh-ide-ui'
if (Test-Path $dst) {
  if ($Force) {
    Write-Host '==> 发现旧安装，-Force 已指定，直接覆盖。'
    Remove-Item $dst -Recurse -Force
  } else {
    $bak = "$dst.bak-$(Get-Date -Format yyyyMMddHHmmss)"
    Move-Item $dst $bak
    Write-Host "==> 旧安装已备份到: $bak"
  }
}

# --- 4. unpack + copy --------------------------------------------------------
$tmp = Join-Path $env:TEMP ("dshide-install-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  tar -xf $PackageTgz -C $tmp
  if (-not (Test-Path "$tmp\package\lib\index.js") -or -not (Test-Path "$tmp\package\lib\client.js")) {
    throw 'tarball 内容不完整（缺少 lib/index.js 或 lib/client.js）。'
  }
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  Copy-Item "$tmp\package\lib" "$dst\lib" -Recurse -Force
  Copy-Item "$tmp\package\package.json" "$dst\package.json" -Force
  if (Test-Path "$tmp\package\README.md") { Copy-Item "$tmp\package\README.md" "$dst\README.md" -Force }
} finally {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

# --- 5. point the profile dependency at the tarball --------------------------
$pkgFile = Join-Path $ProfileDir 'package.json'
$pkg = Get-Content $pkgFile -Raw | ConvertFrom-Json
$deps = [ordered]@{}
if ($null -ne $pkg.dependencies) {
  foreach ($p in $pkg.dependencies.PSObject.Properties) { $deps[$p.Name] = $p.Value }
}
$deps['dsh-ide-ui'] = 'file:' + ($PackageTgz -replace '\\', '/')
$pkg.dependencies = $deps
[System.IO.File]::WriteAllText($pkgFile, ($pkg | ConvertTo-Json -Depth 20), (New-Object System.Text.UTF8Encoding($false)))

# --- 6. activate the plugin row in cordis.patch.yml (idempotent) -------------
$patchFile = Join-Path $ProfileDir 'cordis.patch.yml'
$patch = if (Test-Path $patchFile) { Get-Content $patchFile -Raw } else { '' }
$patchRow = "- insert:`n    - id: ide-ui`n      name: 'dsh-ide-ui'`n"
if ($patch -match "name:\s*'dsh-ide-ui'") {
  Write-Host '==> cordis.patch.yml 已包含 dsh-ide-ui 行，跳过。'
} elseif ($patch -match '^\s*\[\s*\]\s*$' -or $patch.Trim() -eq '') {
  [System.IO.File]::WriteAllText($patchFile, $patchRow, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host '==> cordis.patch.yml 已写入激活行。'
} else {
  Add-Content -Path $patchFile -Value "`n$patchRow" -Encoding utf8
  Write-Host '==> cordis.patch.yml 已追加激活行。'
}

# --- 7. sanity checks --------------------------------------------------------
$ver = (Get-Content "$dst\package.json" -Raw | ConvertFrom-Json).version
$hostSrc = Get-Content "$dst\lib\index.js" -Raw
$clientSrc = Get-Content "$dst\lib\client.js" -Raw
$ok = $true
if ($hostSrc -notmatch 'IdeService') { Write-Host '[FAIL] host 半缺少 IdeService'; $ok = $false }
if ($clientSrc -notmatch 'id: "dsh-ide-ui"') { Write-Host '[FAIL] client 半 bundle id 不匹配'; $ok = $false }
if ($clientSrc -notmatch 'sidebar\.workspaces') { Write-Host '[FAIL] client 半缺少槽位注册'; $ok = $false }
if (-not $ok) { throw '安装校验失败，请检查 tarball。' }

Write-Host ''
Write-Host "[OK] dsh-ide-ui $ver 已安装到 profile '$ProfileName'" -ForegroundColor Green
Write-Host ''
Write-Host '下一步：重启 dsh web（必须完全重启进程，浏览器刷新不够）：'
Write-Host '  1) 找到占用 3080 的进程并结束：'
Write-Host "     Get-NetTCPConnection -LocalPort 3080 | Select-Object OwningProcess"
Write-Host "     Stop-Process -Id <PID> -Force"
Write-Host '  2) 重新启动：'
Write-Host '     npx @deepseek-ai/dsh web --port 3080'
Write-Host '  3) 浏览器打开 http://127.0.0.1:3080（建议开新会话测试）'
