import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

/**
 * Seed script to create a demo user with email demo@censusgrid.com and the password from DEMO_USER_PASSWORD
 * This user will have a PRO plan and a default API key for immediate access.
 */
async function seedDemoUser() {
  try {
    console.log('Starting demo user seed...');

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@censusgrid.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists. Skipping creation.');
      console.log('Demo user email:', existingUser.email);
      console.log('Demo user plan:', existingUser.plan);
      
      // Check if user has API keys
      const existingKeys = await prisma.apiKey.findMany({
        where: { userId: existingUser.id }
      });
      
      if (existingKeys.length > 0) {
        console.log('Demo user has', existingKeys.length, 'API key(s):');
        existingKeys.forEach(key => {
          console.log('  -', key.name, ':', key.key);
        });
      } else {
        console.log('Demo user has no API keys. Creating one...');
        const apiKey = await prisma.apiKey.create({
          data: {
            key: generateApiKey(),
            name: 'Demo API Key',
            userId: existingUser.id,
            isActive: true
          }
        });
        console.log('Created API key:', apiKey.key);
      }
      
      return;
    }

    // Hash the password
    const demoPassword = process.env.DEMO_USER_PASSWORD;
    if (!demoPassword || demoPassword.length < 8) {
      throw new Error('Set DEMO_USER_PASSWORD (min 8 chars) in the environment before seeding the demo user.');
    }
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    // Create the demo user with PRO plan
    const demoUser = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@censusgrid.com',
        passwordHash,
        role: 'USER',
        plan: 'PRO',
        isActive: true
      }
    });

    console.log('Created demo user:', demoUser.email);
    console.log('Demo user ID:', demoUser.id);
    console.log('Demo user plan:', demoUser.plan);

    // Generate and create an API key for the demo user
    const apiKey = await prisma.apiKey.create({
      data: {
        key: generateApiKey(),
        name: 'Demo API Key',
        userId: demoUser.id,
        isActive: true
      }
    });

    console.log('Created API key for demo user:', apiKey.key);
    console.log('Demo user seed completed successfully!');

  } catch (error) {
    console.error('Error seeding demo user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate a random API key
 */
function generateApiKey() {
  const prefix = 'cg_';
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
}

// Run the seed script
seedDemoUser();
