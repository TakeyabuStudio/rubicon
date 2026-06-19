# Extract :root design tokens and main CSS from the mockup's <style> block
# into src/styles/tokens.css and src/styles/main.css, then verify.
# ASCII-only source (Windows PowerShell 5.1 reads .ps1 as ANSI). All file I/O
# uses .NET UTF-8 (no BOM) so the mockup's Japanese content is preserved.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$mockup = Join-Path $root 'RUBICON_mockup.html'
$stylesDir = Join-Path $root 'src\styles'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$html = [System.IO.File]::ReadAllText($mockup)
$style = [regex]::Match($html, '(?s)<style>(.*?)</style>').Groups[1].Value
$rootBlock = [regex]::Match($style, '(?s):root \{.*?\}').Value

# main: drop the "Design Tokens" heading comment and the :root block
$main = [regex]::Replace($style, '(?s)/\* =+\s*\r?\n\s*Design Tokens\s*\r?\n\s*=+ \*/\s*\r?\n', '')
$main = [regex]::Replace($main, '(?s):root \{.*?\}\s*', '')
# retire legacy cyan rgba(0,217,255) -> turquoise rgb(45,212,191) = #2DD4BF
$main = $main.Replace('0, 217, 255', '45, 212, 191')

New-Item -ItemType Directory -Force $stylesDir | Out-Null
$header = "/* Design Tokens - source of truth: RUBICON_mockup.html. Accent = turquoise #2DD4BF (legacy cyan retired) */`r`n"
[System.IO.File]::WriteAllText((Join-Path $stylesDir 'tokens.css'), ($header + $rootBlock + "`r`n"), $utf8)
[System.IO.File]::WriteAllText((Join-Path $stylesDir 'main.css'), ($main.Trim() + "`r`n"), $utf8)

# ---- verification ----
$tokensCss = [System.IO.File]::ReadAllText((Join-Path $stylesDir 'tokens.css'))
$mainCss = [System.IO.File]::ReadAllText((Join-Path $stylesDir 'main.css'))
function Count([string]$t, [string]$n) { ([regex]::Matches($t, [regex]::Escape($n))).Count }

Write-Output '--- verification ---'
Write-Output ("tokens.css #2DD4BF: {0} (expect >=1)" -f (Count $tokensCss '#2DD4BF'))
Write-Output ("tokens.css #00D9FF: {0} (expect 0)" -f (Count $tokensCss '#00D9FF'))
Write-Output ("main.css ':root': {0} (expect 0)" -f (Count $mainCss ':root'))
Write-Output ("main.css legacy cyan '0, 217, 255': {0} (expect 0)" -f (Count $mainCss '0, 217, 255'))
$bs = Count $style '{'; $bt = Count $tokensCss '{'; $bm = Count $mainCss '{'
Write-Output ("brace '{{' counts  style={0}  tokens={1}  main={2}  sum={3} (expect sum==style)" -f $bs, $bt, $bm, ($bt + $bm))
