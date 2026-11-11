# Better Auth Migration SQL - Mission 12B.8.2

## Migration File
**Location:** `prisma/migrations/20261107000000_add_better_auth_models/migration.sql`

## Purpose
Add Better Auth required models (Account, Session, Verification) and update User model for email/password authentication consolidation.

## SQL Summary

### 1. Enum Update (Run OUTSIDE transaction)
```sql
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';
```
**Note:** PostgreSQL doesn't support `IF NOT EXISTS` for `ALTER TYPE ... ADD VALUE`. Run this separately if enum value doesn't exist.

### 2. User Table Modifications
```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
```

### 3. Account Table (Better Auth - account providers including email/password)
```sql
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
    "password" TEXT,  -- Better Auth stores password hash here
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
```

### 4. Session Table (Better Auth - authentication sessions)
```sql
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
```

### 5. Verification Table (Better Auth - email verification & password reset tokens)
```sql
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);
```

### 6. Required Unique Indexes
```sql
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_accountId_providerId_key" ON "accounts"("accountId", "providerId");
CREATE UNIQUE INDEX IF NOT EXISTS "verifications_identifier_value_key" ON "verifications"("identifier", "value");
```

### 7. Foreign Keys
```sql
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 8. Documentation Comments
```sql
COMMENT ON TABLE "accounts" IS 'Better Auth: provedores de conta vinculados ao usuario (inclui email/password)';
COMMENT ON TABLE "sessions" IS 'Better Auth: sessoes ativas de autenticacao';
COMMENT ON TABLE "verifications" IS 'Better Auth: tokens de verificacao de email e redefinicao de senha';
```

## Application Instructions

### Prerequisites
- PostgreSQL database running
- `DATABASE_URL` environment variable configured
- Prisma CLI installed (`npx prisma`)

### Apply Migration
```bash
# Option 1: Full deploy (runs in transaction - may fail on ALTER TYPE)
npx prisma migrate deploy

# Option 2: Manual step-by-step (recommended for ALTER TYPE issue)
# 1. Run ALTER TYPE separately (outside transaction):
psql $DATABASE_URL -c "ALTER TYPE \"Role\" ADD VALUE 'CUSTOMER';"

# 2. Apply remaining migration:
npx prisma migrate deploy

# Or apply manually:
psql $DATABASE_URL -f prisma/migrations/20261107000000_add_better_auth_models/migration.sql
```

### Verify Migration
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt accounts sessions verifications"

# Check columns
psql $DATABASE_URL -c "\d users"
psql $DATABASE_URL -c "\d accounts"
psql $DATABASE_URL -c "\d sessions"
psql $DATABASE_URL -c "\d verifications"

# Check indexes
psql $DATABASE_URL -c "\di sessions_token_key accounts_accountId_providerId_key verifications_identifier_value_key"
```

## Compatibility Notes

### Better Auth 1.7.18 Requirements Met
- ✅ `Account` model with `password` field for email/password credentials
- ✅ `Session` model with `token`, `expiresAt`, `ipAddress`, `userAgent`
- ✅ `Verification` model with `identifier`, `value`, `expiresAt`
- ✅ Unique indexes on `sessions.token`, `accounts(accountId, providerId)`, `verifications(identifier, value)`
- ✅ Cascade delete on user deletion

### Password Hash Storage
- Better Auth stores scrypt hashes in `Account.password` (not `User.passwordHash`)
- Format: `salt:hash` (hex encoded, 16 bytes salt + 64 bytes hash = 161 chars)
- Legacy hashes (r=8) in `User.passwordHash` supported via dual verification

### Multi-Tenant Considerations
- All tables reference `users` table via `user_id` foreign key
- Shop isolation maintained at application layer (tRPC procedures)
- No direct shop references in auth tables (Better Auth standard)

## Rollback Plan
```sql
-- Drop foreign keys first
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_fkey";
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_fkey";

-- Drop tables
DROP TABLE IF EXISTS "verifications";
DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "accounts";

-- Revert user changes
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BARBER';  -- or previous default
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";

-- Remove CUSTOMER from Role enum (requires recreating enum)
-- CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'BARBER');
-- ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING "role"::text::"Role_new";
-- DROP TYPE "Role";
-- ALTER TYPE "Role_new" RENAME TO "Role";
```

## Testing Checklist
- [ ] Migration applies cleanly on fresh database
- [ ] Migration applies on existing database with data
- [ ] Better Auth signup/signin works after migration
- [ ] Password reset flow works
- [ ] Session management works
- [ ] Legacy password verification still works (dual verify)
- [ ] Rate limiting works with new tables
- [ ] CSRF tokens stored in session work