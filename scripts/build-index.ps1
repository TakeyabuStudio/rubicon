# Generate index.html from RUBICON_mockup.html (the look-and-feel source of truth):
#  - replace the inline <style> block with stylesheet <link>s
#  - replace the demo <script> with the Vite module entry
#  - empty the JS-populated containers (input chips / output checkboxes)
#  - tag the results container with an id for JS to fill
# ASCII-only source. All file I/O uses .NET UTF-8 (no BOM) to preserve Japanese.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$mockup = Join-Path $root 'RUBICON_mockup.html'
$out = Join-Path $root 'index.html'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$h = [System.IO.File]::ReadAllText($mockup)

$links = @"
<link rel="stylesheet" href="/src/styles/tokens.css" />
<link rel="stylesheet" href="/src/styles/main.css" />
"@

# 1. inline <style>...</style> -> external stylesheet links
$h = [regex]::Replace($h, '(?s)<style>.*?</style>', { param($m) $links })

# 2. demo <script>...</script> (bare tag; JSON-LD has a type attr so it is untouched)
$moduleTag = '<script type="module" src="/src/main.js"></script>'
$h = [regex]::Replace($h, '(?s)<script>.*?</script>', { param($m) $moduleTag })

# 3. empty the input chip selector and tag it
$h = [regex]::Replace($h, '(?s)<div class="site-selector">.*?</div>', '<div class="site-selector" id="input-selector"></div>')

# 4. empty the output multi-select and tag it
$h = [regex]::Replace($h, '(?s)<div class="site-multiselect">.*?</div>', '<div class="site-multiselect" id="output-selector"></div>')

# 5. tag the results container (keep nested demo cards; JS clears them on load)
$h = $h.Replace('<div class="results">', '<div class="results" id="results">')

[System.IO.File]::WriteAllText($out, $h, $utf8)

# ---- verification ----
$g = [System.IO.File]::ReadAllText($out)
function Count([string]$t, [string]$n) { ([regex]::Matches($t, [regex]::Escape($n))).Count }
Write-Output '--- verification ---'
Write-Output ("<style> tags: {0} (expect 0)" -f (Count $g '<style>'))
Write-Output ("stylesheet links: {0} (expect 2)" -f (Count $g 'rel="stylesheet"'))
Write-Output ("module script: {0} (expect 1)" -f (Count $g $moduleTag))
Write-Output ("ld+json blocks kept: {0} (expect 1)" -f (Count $g 'application/ld+json'))
Write-Output ("input-selector id: {0} (expect 1)" -f (Count $g 'id="input-selector"'))
Write-Output ("output-selector id: {0} (expect 1)" -f (Count $g 'id="output-selector"'))
Write-Output ("results id: {0} (expect 1)" -f (Count $g 'class="results" id="results"'))
Write-Output ("site tiles: {0} (expect 28)" -f (Count $g 'class="site-tile"'))
