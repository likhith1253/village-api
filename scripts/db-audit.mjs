import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query', 'warn', 'error'] });

async function main() {
  console.log('\n=== 1. DATABASE URL ===');
  const url = process.env.DATABASE_URL || 'UNDEFINED';
  console.log('Host:', url.split('@')[1]?.split('/')[0] || 'UNKNOWN');
  console.log('DB name:', url.split('/').pop()?.split('?')[0] || 'UNKNOWN');

  console.log('\n=== 2. ALL TABLES IN PUBLIC SCHEMA ===');
  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log(tables);

  console.log('\n=== 3. USER TABLE ROW COUNT ===');
  const count = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM "User"');
  console.log(count);

  console.log('\n=== 4. ALL USERS ===');
  const users = await prisma.$queryRawUnsafe('SELECT id, name, email, "createdAt" FROM "User" ORDER BY id');
  console.log(users);

  console.log('\n=== 5. ALL SCHEMAS IN DB ===');
  const schemas = await prisma.$queryRawUnsafe(
    `SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`
  );
  console.log(schemas);

  console.log('\n=== 6. CURRENT DATABASE ===');
  const db = await prisma.$queryRawUnsafe('SELECT current_database(), current_schema()');
  console.log(db);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('FATAL ERROR:', e.message);
  process.exit(1);
});
