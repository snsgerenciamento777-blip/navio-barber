-- 1. Verificar se enum Role existe
SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') AS role_enum_exists;

-- 2. Estrutura da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Existência das tabelas Better Auth
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('accounts', 'sessions', 'verifications');

-- 4. Colunas das tabelas Better Auth (se existirem)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('accounts', 'sessions', 'verifications')
ORDER BY table_name, ordinal_position;

-- 5. Índices únicos
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('accounts', 'sessions', 'verifications', 'users')
ORDER BY tablename, indexname;

-- 6. Foreign keys
SELECT conname, conrelid::regclass AS tabela, confrelid::regclass AS referencia,
       pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE contype = 'f' AND conrelid IN ('accounts'::regclass, 'sessions'::regclass, 'verifications'::regclass);

-- 7. Migration history
SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations
ORDER BY finished_at;

-- 8. PostgreSQL version
SELECT version();