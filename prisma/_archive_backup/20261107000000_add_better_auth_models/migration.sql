-- Migration: Add Better Auth models (Account, Session, Verification)
-- Mission 12B.8.2 — Consolidação da Autenticação
-- Aplicar com: npx prisma migrate deploy (requer PostgreSQL conectado)
-- NOTA: ALTER TYPE ... ADD VALUE nao pode executar dentro de transacao.
-- Se o prisma migrate deploy envolver tudo em transacao, executar esta linha separadamente.

-- 1. Alterar enum Role: adicionar CUSTOMER
-- PostgreSQL nao suporta IF NOT EXISTS em ALTER TYPE ... ADD VALUE.
-- Executar esta linha FORA de transacao, se necessario.
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- 2. Alterar tabela users: adicionar email_verified, tornar password_hash nullable, mudar default de role
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- 3. Criar tabela accounts (Better Auth — provedores de conta, incluindo email/password)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- 4. Criar tabela sessions (Better Auth — sessões de autenticação)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- 5. Criar tabela verifications (Better Auth — verificação de email)
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- 6. Índices únicos exigidos pelo Better Auth
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_accountId_providerId_key" ON "accounts"("accountId", "providerId");
CREATE UNIQUE INDEX IF NOT EXISTS "verifications_identifier_value_key" ON "verifications"("identifier", "value");

-- 7. Chaves estrangeiras
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Comentários para documentação
COMMENT ON TABLE "accounts" IS 'Better Auth: provedores de conta vinculados ao usuario (inclui email/password)';
COMMENT ON TABLE "sessions" IS 'Better Auth: sessoes ativas de autenticacao';
COMMENT ON TABLE "verifications" IS 'Better Auth: tokens de verificacao de email e redefinicao de senha';
