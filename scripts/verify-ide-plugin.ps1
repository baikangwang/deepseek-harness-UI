# verify-ide-plugin.ps1 - one-click dsh-ide-ui environment verification
# Usage: pwsh -File scripts/verify-ide-plugin.ps1
# All checks must print [OK] before restarting dsh web; fix any [FAIL] first.

$ErrorActionPreference = 'Continue'
$profile = "$env:USERPROFILE\.dsh\profiles\web"
$failed = 0

function Check($name, $cond, $detail) {
  if ($cond) { Write-Host "[OK]   $name" }
  else { Write-Host "[FAIL] $name - $detail"; $script:failed++ }
}

Write-Host "=== dsh-ide-ui plugin environment verification ==="

# 1. patch active (single dual-face row)
$patch = Get-Content "$profile\cordis.patch.yml" -Raw -ErrorAction SilentlyContinue
Check "patch activates ide-ui (single row)" ($patch -match '(?m)^- insert:' -and $patch -match "name: 'dsh-ide-ui'") "plugin row missing or commented out"
Check "patch has no ui-ide row" ($patch -notmatch 'ui-ide') "old two-row patch still present (dsh-client-ide-ui is merged)"

# 2. host plugin loads
try {
  $hostUrl = 'file:///' + ($profile -replace '\\', '/') + '/node_modules/dsh-ide-ui/lib/index.js'
  $js = "import('" + $hostUrl + "').then(function(m){console.log(JSON.stringify({name:m.default.name}))}).catch(function(e){console.error(e.message);process.exit(1)})"
  $mod = node -e $js 2>&1
  Check "host dsh-ide-ui loads" ($LASTEXITCODE -eq 0) "host load failed: $mod"
  if ($mod) { Check "host registers ide" ($mod -match 'IdeService') "bad export: $mod" }
} catch { Check "host dsh-ide-ui loads" $false "exception: $_" }

# 3. single-package layout: dsh-client-ide-ui must be gone
Check "dsh-client-ide-ui removed" (-not (Test-Path "$profile\node_modules\dsh-client-ide-ui")) "old client package still installed"

# 4. client half deployed inside dsh-ide-ui
$clientJs = Join-Path $profile 'node_modules\dsh-ide-ui\lib\client.js'
$hostJs = Join-Path $profile 'node_modules\dsh-ide-ui\lib\index.js'
$src = Get-Content $clientJs -Raw -ErrorAction SilentlyContinue
$hostSrc = Get-Content $hostJs -Raw -ErrorAction SilentlyContinue
Check "client.js exists (in dsh-ide-ui)" ($null -ne $src) "merged client.js missing"
Check "client bundle id = dsh-ide-ui" ($src -match 'id: "dsh-ide-ui"') "client bundle id mismatch"
Check "client fix deployed (ctx.get remote.ide)" ($src -match 'ctx\.get\("remote\.ide"\)') "still uses ctx.remote.ide or old build"
Check "client shadow priority (-1)" ($src -match 'priority:\s*-1') "sidebar.workspaces lacks shadow priority (collides with native at 0)"
Check "client flex layout (flex:1)" ($src -match 'dshide-region\{flex:1') "root uses height:100% (breaks inside flex regionArea -> vertical stack)"
Check "client has no old access" ($src -notmatch 'const ide = ctx\.remote\.ide') "old access code still present"
Check "feature: markdown renderer" ($src -match 'renderMarkdown' -and $src -match 'fromMarkdown') "markdown renderer missing"
Check "feature: katex math" ($src -match 'katex') "katex math missing"
Check "feature: file icons" ($src -match 'fileIconKey') "semantic file icons missing"
Check "fix: css-escape -> unicode glyph" ($src -match 'String\.fromCharCode\(parseInt' -and $src -match '\{1,6\}\)\\s\?') "fileicons still renders literal \E0XX escape text"
Check "fix: real file-type maps" ($src -match '"bsl"\s*:\s*"_bsl"' -and $src -match '"readme\.md"\s*:\s*"_info"' -and $src -notmatch '"bsl"\s*:\s*"_"') "file-type maps still all fall back to _ (every file shows the same default icon)"
Check "fix: language-id ext expansion" ($src -match '"ts"\s*:\s*"_typescript"' -and $src -match '"js"\s*:\s*"_javascript"' -and $src -match '"json"\s*:\s*"_json"' -and $src -match '"md"\s*:\s*"_markdown"' -and $src -match '"py"\s*:\s*"_python"') "common extensions (ts/js/json/md/py) missing - genie languageIds not expanded into EXT_MAP"
Check "fix: tsconfig.json uses json icon" ($src -notmatch '"tsconfig\.json"') "tsconfig.json still maps to _tsconfig (user wants json icon)"
Check "feature: git decorations in tree" ($src -match 'gitStatusMap' -and $src -match 'buildGitLookup' -and $src -match 'dshide-git-dot') "explorer git status decorations missing"
Check "host: gitStatusMap + ignored" ($hostSrc -match 'gitStatusMap' -and $hostSrc -match 'parseIgnored') "host gitStatusMap/ignored parsing missing"
Check "icon size 20px" ($src -match 'fileIcon\(e\.path, 20') "file icons still rendered at 16px (too small)"
Check "feature: session expand persist" ($src -match 'dshide\.session\.expanded') "session tree expansion persistence missing"
Check "feature: native session rows" ($src -match 'dshide-session-row' -and $src -match 'dshide-project-row') "native-aligned session rows missing"
Check "feature: preview toggle" ($src -match 'PreviewToggle') "markdown preview toggle missing"

# 5. dsh.client declaration present (dual-face discovery)
$pkgJson = Get-Content "$profile\node_modules\dsh-ide-ui\package.json" -Raw
Check "dsh.client declared" ($pkgJson -match '"client"\s*:\s*\{[^}]*"platform"\s*:\s*"web"') "browser half will not be discovered"
Check "version is rc.19" ($pkgJson -match '"version"\s*:\s*"0\.1\.0-rc\.19"') "package version not bumped"

# 6. no real core packages (fallback lives under profiles/node_modules, NOT profiles/web/node_modules)
$coreRoot = Join-Path (Split-Path $profile -Parent) 'node_modules\@deepseek-ai'
$coreReal = @(Get-ChildItem $coreRoot -ErrorAction SilentlyContinue | Where-Object { -not $_.LinkType })
Check "no real core packages" ($coreReal.Count -eq 0) "found $($coreReal.Count) real dirs: $($coreReal.Name -join ', ')"

# 7. profile package.json clean (single dep)
$pkg = Get-Content "$profile\package.json" -Raw
Check "package.json clean" ($pkg -notmatch 'dsh-client-ide-ui') "dsh-client-ide-ui still in dependencies"
Check "package.json no core packages" ($pkg -notmatch '@deepseek-ai/dsh-(tools|agent|llm|session)') "core packages in package.json"

# 8. fallback junctions (under profiles/node_modules, not profiles/web/node_modules)
$junctions = @(Get-ChildItem $coreRoot -ErrorAction SilentlyContinue | Where-Object { $_.LinkType })
Check "fallback junctions >= 190" ($junctions.Count -ge 190) "only $($junctions.Count) junctions"

Write-Host ""
if ($failed -eq 0) {
  Write-Host "=== ALL PASSED - safe to restart dsh web ===" -ForegroundColor Green
  Write-Host "    Note: test in a NEW session; do not retry old session fc895164 (its history is corrupted)"
  exit 0
} else {
  Write-Host "=== $failed check(s) FAILED - fix before restart ===" -ForegroundColor Red
  exit 1
}
