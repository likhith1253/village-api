import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import http from 'http';

// Direct query — same as what Prisma Studio does internally
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, plan: true, role: true, isActive: true, createdAt: true }
  });

  const result = {
    database: (await prisma.$queryRawUnsafe('SELECT current_database(), current_schema()'))[0],
    userCount: await prisma.user.count(),
    users,
    apiKeys: await prisma.apiKey.findMany()
  };

  // Serve via HTTP so we can hit it from browser
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(result, null, 2));
  });

  server.listen(7777, () => {
    console.log('AUDIT RESULT at http://localhost:7777');
    console.log(JSON.stringify(result, null, 2));
    setTimeout(() => { prisma.$disconnect(); server.close(); process.exit(0); }, 5000);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
