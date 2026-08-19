# build-offline-package.ps1 - assemble the no-build-env offline installer zip.
#
# Developer machine only. Packs the prebuilt tarball + one-click installer into
#   dist/dsh-ide-ui-offline-<version>.zip
# which can be copied to any machine running dsh web (no toolchain needed there).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\build-offline-package.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\build-offline-package.ps1 -Version 0.1.0-rc.19

param(
  [string]$Version = ''
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root 'dist'
$offlineDir = Join-Path $root 'scripts\offline'

if (-not $Version) {
  $Version = (Get-Content (Join-Path $root 'packages\ide\package.json') -Raw | ConvertFrom-Json).version
}
$tgz = Join-Path $dist "dsh-ide-ui-$Version.tgz"
if (-not (Test-Path $tgz)) { throw "请先构建并打包: $tgz 不存在（npm pack --pack-destination dist）" }

$stage = Join-Path $root ".tmp-offline-$Version"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

Copy-Item (Join-Path $offlineDir 'install-dsh-ide-ui.ps1') $stage
Copy-Item (Join-Path $offlineDir 'README.md') $stage
Copy-Item $tgz $stage

# PowerShell 5.1 reads .ps1 without BOM as ANSI -> mojibake breaks parsing.
# Force UTF-8 BOM on the installer copy so any target machine parses it.
$installed = Join-Path $stage 'install-dsh-ide-ui.ps1'
$text = [System.IO.File]::ReadAllText($installed, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($installed, $text, (New-Object System.Text.UTF8Encoding($true)))

$zip = Join-Path $dist "dsh-ide-ui-offline-$Version.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -CompressionLevel Optimal

Remove-Item $stage -Recurse -Force
Write-Host "[OK] 离线安装包已生成:" -ForegroundColor Green
Write-Host "     $zip"
Write-Host "     复制到目标机器，解压后运行 install-dsh-ide-ui.ps1 即可（无需编译环境）。"
