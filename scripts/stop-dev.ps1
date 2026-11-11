# Navio Barber 2.0 — Script de Encerramento Local
# Encerra processos da API e Web iniciados pelo start-dev.ps1.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/stop-dev.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Navio Barber 2.0 — Encerramento Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Encerrar processos npm/node relacionados ao projeto
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*navio-barber*" -or $_.Path -like "*apps*"
}

if ($processes) {
    foreach ($p in $processes) {
        Write-Host "Encerrando processo PID $($p.Id): $($p.ProcessName)" -ForegroundColor Yellow
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Processos encerrados." -ForegroundColor Green
} else {
    Write-Host "Nenhum processo do Navio Barber encontrado." -ForegroundColor Yellow
}

# Também encerrar pelo nome do script se ainda estiver rodando
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*navio-barber*"
} | ForEach-Object {
    Write-Host "Encerrando npm PID $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "" -ForegroundColor Cyan
Write-Host "Encerramento concluído." -ForegroundColor Green
