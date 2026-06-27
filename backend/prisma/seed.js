import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Prisma seed script to create a demo user
 * Run with: npx prisma db seed
 */
async function main() {
  console.log('Starting Prisma seed...');

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@censusgrid.com' }
  });

  if (existingUser) {
    console.log('Demo user already exists. Skipping creation.');
    
    // Ensure user has an API key
    const existingKeys = await prisma.apiKey.findMany({
      where: { userId: existingUser.id }
    });
    
    if (existingKeys.length === 0) {
      const apiKey = await prisma.apiKey.create({
        data: {
          key: `cg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          name: 'Demo API Key',
          userId: existingUser.id,
          isActive: true
        }
      });
      console.log('Created API key for existing demo user:', apiKey.key);
    }
    
    return;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash('demo123', 10);

  // Create the demo user with PRO plan
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@censusgrid.com',
      passwordHash,
      role: 'USER',
      plan: 'PRO',
      isActive: true,
      apiKeys: {
        create: {
          key: `cg_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          name: 'Demo API Key',
          isActive: true
        }
      }
    }
  });

  console.log('Created demo user:', demoUser.email);
  console.log('Demo user plan:', demoUser.plan);
  console.log('Prisma seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
