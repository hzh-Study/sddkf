$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$source = Join-Path $PSScriptRoot '..\skills\spec-generator'
if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "找不到技能源目录：$source"
}

$target = Join-Path $HOME '.agents\skills\spec-generator'
$targetParent = Split-Path -Parent $target
New-Item -ItemType Directory -Force -Path $targetParent | Out-Null

if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
}

Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
Write-Host "Installed spec-generator to $target"
