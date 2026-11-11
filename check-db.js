const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Check if Role enum exists
    const roleExists = await prisma.$queryRaw`
      SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') AS role_enum_exists
    `;
    console.log('1. Role enum exists:', roleExists[0].role_enum_exists);

    // 2. Users table structure
    const usersCols = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.log('2. Users table columns:', JSON.stringify(usersCols, null, 2));

    // 3. Better Auth tables existence
    const betterAuthTables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('accounts', 'sessions', 'verifications')
    `;
    console.log('3. Better Auth tables:', JSON.stringify(betterAuthTables, null, 2));

    // 4. Columns of Better Auth tables if they exist
    const baCols = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('accounts', 'sessions', 'verifications')
      ORDER BY table_name, ordinal_position
    `;
    console.log('4. Better Auth columns:', JSON.stringify(baCols, null, 2));

    // 5. Indexes
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename IN ('accounts', 'sessions', 'verifications', 'users')
      ORDER BY tablename, indexname
    `;
    console.log('5. Indexes:', JSON.stringify(indexes, null, 2));

    // 6. Foreign keys - only if tables exist
    const tablesExist = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('accounts', 'sessions', 'verifications')
    `;
    if (tablesExist.length > 0) {
      const fks = await prisma.$queryRaw`
        SELECT conname, conrelid::regclass AS tabela, confrelid::regclass AS referencia,
               pg_get_constraintdef(oid) AS definicao
        FROM pg_constraint
        WHERE contype = 'f' AND conrelid IN ('accounts'::regclass, 'sessions'::regclass, 'verifications'::regclass)
      `;
      console.log('6. Foreign keys:', JSON.stringify(fks, null, 2));
    } else {
      console.log('6. Foreign keys: [] (tables do not exist)');
    }

    // 7. Migration history - check if table exists first
    const migTableExists = await prisma.$queryRaw`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations' AND table_schema = 'public') AS exists
    `;
    if (migTableExists[0].exists) {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at, rolled_back_at
        FROM _prisma_migrations
        ORDER BY finished_at
      `;
      console.log('7. Migration history:', JSON.stringify(migrations, null, 2));
    } else {
      console.log('7. Migration history: [] (_prisma_migrations table does not exist)');
    }

    // 8. PostgreSQL version
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('8. PostgreSQL version:', version);

    // 9. All tables in public schema
    const allTables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `;
    console.log('9. All tables in public:', JSON.stringify(allTables, null, 2));

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();