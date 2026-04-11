$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root
python -m pip install -r .\requirements-build.txt
python .\tools\build-executable.py
