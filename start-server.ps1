param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Join-Path $root '_site'
if (-not (Test-Path -LiteralPath (Join-Path $site 'manifest.json'))) {
  throw 'Build the site first with npm run build.'
}

Write-Host "Serving validated AI site from $site"
Write-Host "Open http://localhost:$Port/"
python -m http.server $Port --bind 127.0.0.1 --directory $site
