# Navio Barber 2.0 — Script de Setup do Banco de Dados (PostgreSQL Hospedado)
# Compatível com Supabase, Neon ou qualquer PostgreSQL remoto.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/setup-db.ps1
#
# ANTES DE EXECUTAR:
# 1. Crie um projeto no Supabase (supabase.com) ou Neon (neon.tech) — plano gratuito
# 2. Copie a string de conexão (DATABASE_URL) do provedor
# 3. Cole DATABASE_URL no arquivo .env (não commite este arquivo)
# 4. Execute este script

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Navio Barber 2.0 — Setup do Banco de Dados (PostgreSQL Hospedado)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verificar se .env existe
if (!(Test-Path -LiteralPath ".env")) {
    Write-Host "ERRO: .env nao encontrado. Copie .env.example para .env e configure DATABASE_URL." -ForegroundColor Red
    exit 1
}

# 2. Verificar se DATABASE_URL esta configurada no .env
$envContent = Get-Content -LiteralPath ".env" -Raw
if ($envContent -notmatch "DATABASE_URL=.+postgresql://.+") {
    Write-Host "ERRO: DATABASE_URL nao configurada no .env." -ForegroundColor Red
    Write-Host "Edite .env e defina DATABASE_URL com a string de conexao do PostgreSQL hospedado." -ForegroundColor Red
    exit 1
}

# 3. Verificar se prisma CLI esta disponível
$prismaCmd = Get-Command "prisma" -ErrorAction SilentlyContinue
if (-not $prismaCmd) {
    Write-Host "ERRO: Prisma CLI nao esta instalado. Rode: npm install -g prisma" -ForegroundColor Red
    exit 1
}

# 4. Gerar Prisma Client
Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao gerar Prisma Client." -ForegroundColor Red
    exit 1
}

# 5. Aplicar migrations
Write-Host "Aplicando migrations do Prisma..." -ForegroundColor Yellow
npm run db:migrate:dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao aplicar migrations. Verifique a conexao com o PostgreSQL hospedado." -ForegroundColor Red
    exit 1
}

Write-Host "" -ForegroundColor Cyan
Write-Host "Setup concluido com sucesso!" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Inicie a API:   cd apps/api && npm run dev" -ForegroundColor Cyan
Write-Host "  2. Inicie o Web:   cd apps/web  && npm run dev" -ForegroundColor Cyan
Write-Host "  3. Acesse:         http://localhost:3000" -ForegroundColor Cyan
