import 'dotenv/config';
import './config/env.js';
import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 3000;

console.log('SERVER_STARTED');
console.log('ACTIVE_PORT:', PORT);

try {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Verify Prisma client initialization
    try {
      await prisma.$connect();
      console.log('DATABASE_CONNECTED');
      
      // Print DATABASE_URL host safely
      const dbUrl = process.env.DATABASE_URL || '';
      const host = dbUrl.split('@')[1]?.split('/')[0] || 'unknown-host';
      console.log('DATABASE_URL host:', host);
    } catch (dbError) {
      console.error('DATABASE_CONNECTION_ERROR:', dbError);
    }
  });
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}
