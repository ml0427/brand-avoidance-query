param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Serving brand avoidance query page from $root"
Write-Host "Open http://localhost:$Port/"
python -m http.server $Port --directory $root
