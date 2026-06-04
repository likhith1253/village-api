import 'dotenv/config';
import prisma from '../src/config/prisma.js';

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function test() {
  console.log('Starting verification test suite...');

  // 1. GET /health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log('1. Health Check Response:', res.status, data);
    if (res.status === 200 && data.status === 'healthy') {
      console.log('✅ Health Check passed.');
    } else {
      console.error('❌ Health Check failed.');
    }
  } catch (err) {
    console.error('❌ Health Check failed to fetch:', err.message);
  }

  // Generate unique email for standard user
  const email = `testuser_${Date.now()}@example.com`;
  const name = 'Test User';
  const password = 'securepassword';

  // 2. Auth register validation check (missing name)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('2. Register validation check (missing name):', res.status, data);
    if (res.status === 400 && data.message === 'Validation failed' && Array.isArray(data.errors)) {
      console.log('✅ Register validation check (missing name) passed.');
    } else {
      console.error('❌ Register validation check (missing name) failed.');
    }
  } catch (err) {
    console.error('❌ Register validation check failed to fetch:', err.message);
  }

  // 3. Auth register validation check (password too short)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: '123' })
    });
    const data = await res.json();
    console.log('3. Register validation check (password too short):', res.status, data);
    if (res.status === 400 && data.message === 'Validation failed' && data.errors[0].field === 'password') {
      console.log('✅ Register validation check (password too short) passed.');
    } else {
      console.error('❌ Register validation check (password too short) failed.');
    }
  } catch (err) {
    console.error('❌ Register validation check failed to fetch:', err.message);
  }

  // 4. Successful registration
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    console.log('4. Successful registration:', res.status, data);
    if (res.status === 201 && data.success === true) {
      console.log('✅ Registration passed.');
    } else {
      console.error('❌ Registration failed.');
    }
  } catch (err) {
    console.error('❌ Registration failed to fetch:', err.message);
  }

  // 5. Successful login & retrieve token
  let token = '';
  let user = null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('5. Successful login:', res.status, data);
    if (res.status === 200 && data.success === true && data.data.token) {
      token = data.data.token;
      user = data.data.user;
      console.log('✅ Login passed. Token acquired.');
    } else {
      console.error('❌ Login failed.');
    }
  } catch (err) {
    console.error('❌ Login failed to fetch:', err.message);
  }

  if (!token) {
    console.error('⚠️ Could not proceed without valid authentication token.');
    return;
  }

  // 6. Access analytics (should fail for standard user since they are USER role)
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('6. Access analytics as USER:', res.status, data);
    if (res.status === 403 && data.success === false && data.message.includes('Admin access required')) {
      console.log('✅ Analytics route access restriction passed (403 forbidden).');
    } else {
      console.error('❌ Analytics route access restriction failed.');
    }
  } catch (err) {
    console.error('❌ Analytics route check failed to fetch:', err.message);
  }

  // 7. Get profile details
  try {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('7. Get profile details:', res.status, data);
    if (res.status === 200 && data.success === true && data.data.email === email) {
      console.log('✅ Get profile passed.');
    } else {
      console.error('❌ Get profile failed.');
    }
  } catch (err) {
    console.error('❌ Get profile failed to fetch:', err.message);
  }

  // 8. Update profile details (both name and email, or name only)
  const newName = 'Updated Name';
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    });
    const data = await res.json();
    console.log('8. Update profile details:', res.status, data);
    if (res.status === 200 && data.success === true && data.data.name === newName) {
      console.log('✅ Update profile passed.');
    } else {
      console.error('❌ Update profile failed.');
    }
  } catch (err) {
    console.error('❌ Update profile failed to fetch:', err.message);
  }

  // 9. Update password
  const newPassword = 'newsecurepassword';
  try {
    const res = await fetch(`${BASE_URL}/api/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword: password, newPassword })
    });
    const data = await res.json();
    console.log('9. Update password:', res.status, data);
    if (res.status === 200 && data.success === true) {
      console.log('✅ Update password passed.');
    } else {
      console.error('❌ Update password failed.');
    }
  } catch (err) {
    console.error('❌ Update password failed to fetch:', err.message);
  }

  // Login again with new password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword })
    });
    const data = await res.json();
    console.log('9b. Login with new password:', res.status, data);
    if (res.status === 200 && data.success === true) {
      token = data.data.token;
      console.log('✅ Login with new password passed.');
    } else {
      console.error('❌ Login with new password failed.');
    }
  } catch (err) {
    console.error('❌ Login with new password failed to fetch:', err.message);
  }

  // 10. Generate API key
  let apiKeyId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'My Verification Key' })
    });
    const data = await res.json();
    console.log('10. Generate API key:', res.status, data);
    if (res.status === 201 && data.success === true && data.data.id) {
      apiKeyId = data.data.id;
      console.log('✅ Generate API key passed.');
    } else {
      console.error('❌ Generate API key failed.');
    }
  } catch (err) {
    console.error('❌ Generate API key failed to fetch:', err.message);
  }

  if (!apiKeyId) {
    console.error('⚠️ Could not proceed with API Key CRUD tests without a valid key ID.');
    return;
  }

  // 11. Retrieve API keys
  try {
    const res = await fetch(`${BASE_URL}/api/keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('11. Retrieve API keys:', res.status, data);
    if (res.status === 200 && data.success === true && Array.isArray(data.data) && data.data.length > 0) {
      console.log('✅ Retrieve API keys passed.');
    } else {
      console.error('❌ Retrieve API keys failed.');
    }
  } catch (err) {
    console.error('❌ Retrieve API keys failed to fetch:', err.message);
  }

  // 12. Update API key (Rename and Toggle Status)
  const updatedKeyName = 'Updated Verification Key';
  try {
    const res = await fetch(`${BASE_URL}/api/keys/${apiKeyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: updatedKeyName, isActive: false })
    });
    const data = await res.json();
    console.log('12. Update API key:', res.status, data);
    if (res.status === 200 && data.success === true && data.data.name === updatedKeyName && data.data.isActive === false) {
      console.log('✅ Update API key passed.');
    } else {
      console.error('❌ Update API key failed.');
    }
  } catch (err) {
    console.error('❌ Update API key failed to fetch:', err.message);
  }

  // 13. Delete / Revoke API key
  try {
    const res = await fetch(`${BASE_URL}/api/keys/${apiKeyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('13. Revoke API key:', res.status, data);
    if (res.status === 200 && data.success === true) {
      console.log('✅ Revoke API key passed.');
    } else {
      console.error('❌ Revoke API key failed.');
    }
  } catch (err) {
    console.error('❌ Revoke API key failed to fetch:', err.message);
  }

  // Let's verify revocation worked by listing keys
  try {
    const res = await fetch(`${BASE_URL}/api/keys`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('13b. Retrieve API keys post-revocation:', res.status, data);
    if (res.status === 200 && data.success === true && data.data.findIndex(k => k.id === apiKeyId) === -1) {
      console.log('✅ Verification of revocation passed.');
    } else {
      console.error('❌ Verification of revocation failed.');
    }
  } catch (err) {
    console.error('❌ Retrieve API keys post-revocation failed to fetch:', err.message);
  }

  // 14. ADMIN Analytics validation check (must promote a user to ADMIN in DB first)
  try {
    // Promote user in DB using prisma directly
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`User ${email} promoted to ADMIN in DB.`);

    // Login again to get a new token with ADMIN role
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword })
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.data.token;

    const res = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log('14. Access analytics as ADMIN:', res.status, data);
    if (res.status === 200 && data.success === true && data.data) {
      console.log('✅ Analytics route access for ADMIN passed.');
    } else {
      console.error('❌ Analytics route access for ADMIN failed.');
    }
  } catch (err) {
    console.error('❌ ADMIN analytics check failed:', err.message);
  } finally {
    // Cleanup the test user
    try {
      if (user) {
        await prisma.apiLog.deleteMany({
          where: { userId: user.id }
        });
      }
      await prisma.user.delete({
        where: { email }
      });
      console.log(`Test user ${email} cleaned up successfully.`);
    } catch (cleanupErr) {
      console.error('⚠️ Cleanup failed:', cleanupErr.message);
    }
  }
}

test()
  .then(() => {
    console.log('Verification test suite execution finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Verification suite encountered unexpected error:', err);
    process.exit(1);
  });
