import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';

async function main() {
  const email = 'frontend@test.com';
  const newPassword = 'password123';
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      isActive: true
    }
  });

  console.log('User password reset successfully:');
  console.log(JSON.stringify({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    isActive: updatedUser.isActive,
    newPassword
  }, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Failed to reset password:', err);
  process.exit(1);
});
