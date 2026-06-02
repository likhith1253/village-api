import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulate exactly what Prisma Studio does - query each model
async function main() {
  console.log('\n=== CONNECTION INFO ===');
  const dbInfo = await prisma.$queryRawUnsafe('SELECT current_database(), current_schema(), version()');
  console.log(JSON.stringify(dbInfo, null, 2));

  console.log('\n=== USER COUNT ===');
  const userCount = await prisma.user.count();
  console.log('user.count():', userCount);

  console.log('\n=== ALL USERS via prisma.user.findMany() ===');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== APIKEY COUNT ===');
  const keyCount = await prisma.apiKey.count();
  console.log('apiKey.count():', keyCount);

  console.log('\n=== _prisma_migrations ===');
  const migrations = await prisma.$queryRawUnsafe('SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at');
  console.log(JSON.stringify(migrations, null, 2));

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(e => {
  console.error('ERROR:', e.message, e.code);
  process.exit(1);
});
