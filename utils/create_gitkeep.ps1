Get-ChildItem -Directory -Recurse -Force |
    Where-Object {
        $_.FullName -notmatch '\\\.git(\\|$)' -and
        -not (Get-ChildItem -LiteralPath $_.FullName -Force | Select-Object -First 1)
    } |
    ForEach-Object {
        New-Item -ItemType File -Path (Join-Path $_.FullName '.gitkeep') -Force | Out-Null
    }
