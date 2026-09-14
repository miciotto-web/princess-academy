# Princess Academy — forza Node 20.20.1 per gli script del progetto
$env:Path = "C:\nvm4w\nodejs;$env:Path"

$cmd = $args -join " "
if (-not $cmd) {
  Write-Error "Nessun comando specificato."
  exit 1
}

Invoke-Expression $cmd
