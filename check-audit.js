const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== 1. _prisma_migrations ===');
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, rolled_back_at, logs
      FROM _prisma_migrations
      ORDER BY finished_at
    `;
    console.log(JSON.stringify(migrations, null, 2));

    console.log('\n=== 2. All Tables ===');
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(JSON.stringify(tables, null, 2));

    console.log('\n=== 3. Enums ===');
    const enums = await prisma.$queryRaw`
      SELECT typname, enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typtype = 'e' AND t.typnamespace = 'public'::regnamespace
      ORDER BY typname, enumsortorder
    `;
    console.log(JSON.stringify(enums, null, 2));

    console.log('\n=== 4. Indexes ===');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n=== 5. Foreign Keys ===');
    const fks = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `;
    console.log(JSON.stringify(fks, null, 2));

    console.log('\n=== 6. Primary Keys ===');
    const pks = await prisma.$queryRaw`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `;
    console.log(JSON.stringify(pks, null, 2));

    console.log('\n=== 7. Column Details (sample tables) ===');
    const cols = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;
    console.log(JSON.stringify(cols, null, 2));

  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();