# Navio Barber 2.0 — Script de Inicialização Local
# Inicia API (porta 3001) e Web (porta 3000) sequencialmente.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Navio Barber 2.0 — Inicialização Local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verificar se .env existe
if (!(Test-Path -LiteralPath ".env")) {
    Write-Host "ERRO: .env nao encontrado. Copie .env.example para .env e configure DATABASE_URL." -ForegroundColor Red
    exit 1
}

# 2. Verificar se DATABASE_URL esta configurada
$envContent = Get-Content -LiteralPath ".env" -Raw
if ($envContent -notmatch "DATABASE_URL=.+postgresql://.+") {
    Write-Host "ERRO: DATABASE_URL nao configurada no .env." -ForegroundColor Red
    Write-Host "Configure DATABASE_URL com a string de conexao do PostgreSQL hospedado (Supabase/Neon)." -ForegroundColor Red
    exit 1
}

# 3. Iniciar API em background (porta 3001)
Write-Host "Iniciando API na porta 3001..." -ForegroundColor Yellow
$apiProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "apps/api" -PassThru -WindowStyle Hidden
Write-Host "API iniciada (PID: $($apiProcess.Id))" -ForegroundColor Green

# Aguardar a API ficar disponível
Write-Host "Aguardando API ficar disponível..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 4. Iniciar Web em background (porta 3000)
Write-Host "Iniciando Web na porta 3000..." -ForegroundColor Yellow
$webProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "apps/web" -PassThru -WindowStyle Hidden
Write-Host "Web iniciada (PID: $($webProcess.Id))" -ForegroundColor Green

Write-Host "" -ForegroundColor Cyan
Write-Host "Navio Barber 2.0 esta rodando!" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "  API:   http://localhost:3001/trpc" -ForegroundColor Cyan
Write-Host "  Web:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "Para encerrar, rode: powershell -ExecutionPolicy Bypass -File scripts/stop-dev.ps1" -ForegroundColor Cyan
