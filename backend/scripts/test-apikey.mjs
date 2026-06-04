import 'dotenv/config';

const BASE = 'http://localhost:3000';

async function test() {
  // Step 1: Login to get token
  console.log('\n=== STEP 1: LOGIN ===');
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status);
  console.log('Login response:', JSON.stringify(loginData, null, 2));

  if (!loginData.data?.token) {
    console.error('No token received — stopping test');
    return;
  }

  const token = loginData.data.token;
  console.log('\nToken received:', token.substring(0, 30) + '...');

  // Step 2: Create API Key using the token
  console.log('\n=== STEP 2: CREATE API KEY ===');
  const keyRes = await fetch(`${BASE}/api/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Test Key' })
  });
  const keyData = await keyRes.json();
  console.log('CreateKey status:', keyRes.status);
  console.log('CreateKey response:', JSON.stringify(keyData, null, 2));

  // Step 3: Verify in DB
  if (keyData.data?.key) {
    console.log('\n=== STEP 3: VERIFY IN DB ===');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const keys = await prisma.apiKey.findMany({ include: { user: { select: { email: true } } } });
    console.log('All API keys in DB:', JSON.stringify(keys, null, 2));
    await prisma.$disconnect();
  }
}

test().catch(e => console.error('TEST ERROR:', e.message));
