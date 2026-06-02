import 'dotenv/config';
import crypto from 'crypto';
import prisma from '../src/config/prisma.js';

async function main() {
  console.log('Fetching all users from the database...');
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('⚠️ No users found in the database. Please register users first before seeding API keys.');
    return;
  }

  console.log(`Found ${users.length} user(s). Generating API keys...\n`);

  for (const user of users) {
    // Check if the user already has any API keys
    const existingKeys = await prisma.apiKey.findMany({
      where: { userId: user.id }
    });

    if (existingKeys.length > 0) {
      console.log(`ℹ️ User ${user.email} already has ${existingKeys.length} API key(s). Skipping.`);
      continue;
    }

    const randomHex = crypto.randomBytes(24).toString('hex');
    const key = `vap_${randomHex}`;
    const name = `Default Key for ${user.email.split('@')[0]}`;

    await prisma.apiKey.create({
      data: {
        key,
        name,
        userId: user.id
      }
    });

    console.log(`✅ Created API key for ${user.email}: ${key}`);
  }

  // Show final state in DB
  console.log('\n--- Final DB state ---');
  const keys = await prisma.apiKey.findMany({
    include: { user: { select: { id: true, email: true } } }
  });
  console.log(`Total API keys: ${keys.length}`);
  keys.forEach(k => console.log(`  id:${k.id} user:${k.user.email} key:${k.key.substring(0, 20)}...`));
}

main()
  .catch(e => console.error('❌ ERROR:', e.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
