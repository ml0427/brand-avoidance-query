param(
  [string]$SkillRoot = (Join-Path $(if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }) 'skills/brand-avoidance-query')
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$sourceSkill = Join-Path $repo 'clients/brand-avoidance-query/SKILL.md'
$sourceReader = Join-Path $repo 'clients/search_brand.py'
foreach ($file in @($sourceSkill, $sourceReader)) {
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing skill source: $file" }
}

$target = [IO.Path]::GetFullPath($SkillRoot)
$scripts = Join-Path $target 'scripts'
New-Item -ItemType Directory -Path $scripts -Force | Out-Null
$pairs = @(
  @($sourceSkill, (Join-Path $target 'SKILL.md')),
  @($sourceReader, (Join-Path $scripts 'search_brand.py'))
)
foreach ($pair in $pairs) {
  Copy-Item -LiteralPath $pair[0] -Destination $pair[1] -Force
  if ((Get-FileHash -LiteralPath $pair[0] -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $pair[1] -Algorithm SHA256).Hash) {
    throw "Skill installation checksum failed: $($pair[1])"
  }
}
Write-Output "Updated query skill: $target"
