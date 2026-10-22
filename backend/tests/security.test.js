import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { start, stop, call, resetFakes, prisma, users, bearer, sign, apiKeys, calls } from './helpers.js';

before(start);
after(stop);
beforeEach(resetFakes);

describe('unauthenticated access is rejected', () => {
  const protectedJwt = [
    ['GET', '/api/keys'],
    ['POST', '/api/keys'],
    ['PATCH', '/api/keys/10'],
    ['DELETE', '/api/keys/10'],
    ['GET', '/api/users/me'],
    ['PUT', '/api/users/profile'],
    ['PUT', '/api/users/password'],
    ['POST', '/api/billing/checkout'],
    ['GET', '/api/analytics/summary'],
    ['GET', '/api/analytics/endpoints'],
    ['GET', '/api/analytics/status-codes'],
    ['GET', '/api/analytics/daily'],
    ['GET', '/api/system/info'],
    ['GET', '/api/usage/me']
  ];
  for (const [method, path] of protectedJwt) {
    test(`${method} ${path} -> 401 without credentials`, async () => {
      const res = await call(method, path);
      assert.equal(res.status, 401);
      assert.equal(res.json.success, false);
    });
  }

  for (const path of ['/api/v1/states', '/api/v1/districts?stateCode=10', '/api/v1/subdistricts?districtCode=1',
    '/api/v1/villages', '/api/v1/villages/search?q=abc', '/api/v1/villages/123', '/api/test-key']) {
    test(`GET ${path} -> 401 without x-api-key`, async () => {
      const res = await call('GET', path);
      assert.equal(res.status, 401);
    });
  }

  test('unknown API key -> 401', async () => {
    const res = await call('GET', '/api/v1/states', { headers: { 'x-api-key': 'vap_nope' } });
    assert.equal(res.status, 401);
  });

  test('inactive API key -> 403', async () => {
    const res = await call('GET', '/api/v1/states', { headers: { 'x-api-key': apiKeys.inactive.key } });
    assert.equal(res.status, 403);
  });

  test('a JWT is not accepted on x-api-key data routes', async () => {
    const res = await call('GET', '/api/v1/states', { headers: bearer(users.pro) });
    assert.equal(res.status, 401);
  });
});

describe('JWT handling', () => {
  test('token signed with another secret -> 401', async () => {
    const t = sign(users.pro, {}, 'some-other-secret-that-is-long-enough-xxxxxxxx');
    const res = await call('GET', '/api/users/me', { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(res.status, 401);
  });

  test('expired token -> 401', async () => {
    const t = sign(users.pro, { expiresIn: -10 });
    const res = await call('GET', '/api/users/me', { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(res.status, 401);
  });

  test('alg=none token -> 401', async () => {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const t = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ userId: 3, role: 'ADMIN', plan: 'PRO' })}.`;
    const res = await call('GET', '/api/analytics/summary', { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(res.status, 401);
  });

  test('HS512 token is rejected (algorithm pinned to HS256)', async () => {
    const t = jwt.sign({ userId: 3 }, process.env.JWT_SECRET, { algorithm: 'HS512' });
    const res = await call('GET', '/api/users/me', { headers: { Authorization: `Bearer ${t}` } });
    assert.equal(res.status, 401);
  });

  test('token for a deactivated user -> 401', async () => {
    prisma.user.findUnique = async () => ({ ...users.pro, isActive: false });
    const res = await call('GET', '/api/users/me', { headers: bearer(users.pro) });
    assert.equal(res.status, 401);
  });

  test('login issues an HS256 token with an expiry and no password hash', async () => {
    const bcrypt = (await import('bcryptjs')).default;
    const passwordHash = await bcrypt.hash('correct-horse-1', 4);
    prisma.user.findUnique = async () => ({ ...users.pro, name: 'P', passwordHash });
    const res = await call('POST', '/api/auth/login', { body: { email: 'pro@test.dev', password: 'correct-horse-1' } });
    assert.equal(res.status, 200);
    const decoded = jwt.decode(res.json.data.token, { complete: true });
    assert.equal(decoded.header.alg, 'HS256');
    assert.ok(decoded.payload.exp > decoded.payload.iat);
    assert.equal(res.json.data.user.passwordHash, undefined);

    const bad = await call('POST', '/api/auth/login', { body: { email: 'pro@test.dev', password: 'wrong-password' } });
    assert.equal(bad.status, 401);
  });
});

describe('authorization (role / plan / ownership)', () => {
  test('FREE user is forbidden from analytics', async () => {
    const res = await call('GET', '/api/analytics/summary', { headers: bearer(users.free) });
    assert.equal(res.status, 403);
  });

  test('PRO user sees only their own analytics (query scoped to userId)', async () => {
    const res = await call('GET', '/api/analytics/endpoints', { headers: bearer(users.pro) });
    assert.equal(res.status, 200);
    assert.equal(calls.groupBy.length, 1);
    assert.equal(calls.groupBy[0].where.userId, users.pro.id);
  });

  test('ADMIN analytics are global (no userId filter)', async () => {
    const res = await call('GET', '/api/analytics/endpoints', { headers: bearer(users.admin) });
    assert.equal(res.status, 200);
    assert.equal(calls.groupBy[0].where, undefined);
  });

  test('/api/system/info is admin-only', async () => {
    assert.equal((await call('GET', '/api/system/info', { headers: bearer(users.pro) })).status, 403);
    assert.equal((await call('GET', '/api/system/info', { headers: bearer(users.admin) })).status, 200);
  });

  test("IDOR: user cannot update or delete another user's API key", async () => {
    // key 10 belongs to user 1; user 2 asks for it
    const patch = await call('PATCH', '/api/keys/10', { headers: bearer(users.pro), body: { isActive: false } });
    assert.equal(patch.status, 404);
    const del = await call('DELETE', '/api/keys/10', { headers: bearer(users.pro) });
    assert.equal(del.status, 404);
    assert.equal(calls.keyDelete.length, 0);
  });

  test('owner can delete their own API key', async () => {
    const del = await call('DELETE', '/api/keys/10', { headers: bearer(users.free) });
    assert.equal(del.status, 200);
    assert.equal(calls.keyDelete.length, 1);
  });

  test('API key listing is scoped to the caller', async () => {
    let seen;
    prisma.apiKey.findMany = async (a) => { seen = a; return []; };
    await call('GET', '/api/keys', { headers: bearer(users.pro) });
    assert.equal(seen.where.userId, users.pro.id);
  });

  test('non-numeric API key id -> 400, not a 500', async () => {
    const res = await call('PATCH', '/api/keys/abc', { headers: bearer(users.free), body: { isActive: true } });
    assert.equal(res.status, 400);
  });

  test('demo token cannot modify profile or password', async () => {
    const demo = await call('POST', '/api/auth/demo-login');
    assert.equal(demo.status, 200);
    const h = { Authorization: `Bearer ${demo.json.data.token}` };
    assert.equal((await call('PUT', '/api/users/profile', { headers: h, body: { name: 'Hacker' } })).status, 403);
    assert.equal((await call('PUT', '/api/users/password', { headers: h, body: { currentPassword: 'x', newPassword: 'longenough1' } })).status, 403);
  });

  test('registration ignores role/plan supplied by the client', async () => {
    let created;
    prisma.user.create = async (a) => { created = a; return { id: 9 }; };
    const res = await call('POST', '/api/auth/register', {
      body: { name: 'Mallory', email: 'm@test.dev', password: 'password123', role: 'ADMIN', plan: 'PRO' }
    });
    assert.equal(res.status, 201);
    assert.equal(created.data.role, undefined);
    assert.equal(created.data.plan, undefined);
    assert.match(created.data.passwordHash, /^\$2[aby]\$/);
  });
});

describe('removed / debug endpoints', () => {
  for (const path of ['/api/debug/users', '/api/debug/runtime', '/api/debug/log-test']) {
    test(`${path} is not routable (even outside production)`, async () => {
      const res = await call('GET', path);
      assert.equal(res.status, 404);
    });
  }
});

describe('Stripe webhook', () => {
  const payload = (type, object) => JSON.stringify({ id: 'evt_1', object: 'event', type, data: { object } });
  const signed = (body, secret = process.env.STRIPE_WEBHOOK_SECRET) =>
    Stripe.webhooks.generateTestHeaderString({ payload: body, secret });
  const jsonHeaders = { 'Content-Type': 'application/json' };

  test('unsigned event is rejected and changes nothing', async () => {
    const body = payload('checkout.session.completed', { customer: 'cus_1', metadata: { userId: '1' } });
    const res = await call('POST', '/api/billing/webhook', { raw: body, headers: jsonHeaders });
    assert.equal(res.status, 400);
    assert.equal(calls.updateMany.length + calls.userUpdate.length, 0);
  });

  test('event with a bad signature is rejected', async () => {
    const body = payload('checkout.session.completed', { customer: 'cus_1', metadata: { userId: '1' } });
    const res = await call('POST', '/api/billing/webhook', {
      raw: body,
      headers: { ...jsonHeaders, 'stripe-signature': signed(body, 'whsec_wrong_secret') }
    });
    assert.equal(res.status, 400);
    assert.equal(calls.updateMany.length, 0);
  });

  test('webhook is closed (503) when no secret is configured', async () => {
    const saved = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const body = payload('checkout.session.completed', { customer: 'cus_1', metadata: { userId: '1' } });
      const res = await call('POST', '/api/billing/webhook', { raw: body, headers: jsonHeaders });
      assert.equal(res.status, 503);
      assert.equal(calls.updateMany.length, 0);
    } finally {
      process.env.STRIPE_WEBHOOK_SECRET = saved;
    }
  });

  test('correctly signed checkout.session.completed upgrades the user', async () => {
    const body = payload('checkout.session.completed', { customer: 'cus_1', metadata: { userId: '1' } });
    const res = await call('POST', '/api/billing/webhook', {
      raw: body,
      headers: { ...jsonHeaders, 'stripe-signature': signed(body) }
    });
    assert.equal(res.status, 200);
    assert.equal(calls.updateMany.length, 1);
    assert.equal(calls.updateMany[0].where.id, 1);
    assert.equal(calls.updateMany[0].data.plan, 'PRO');
  });

  test('signed subscription.updated with non-active status downgrades the user', async () => {
    prisma.user.findFirst = async () => ({ id: 2 });
    const body = payload('customer.subscription.updated', { customer: 'cus_2', status: 'past_due' });
    const res = await call('POST', '/api/billing/webhook', {
      raw: body,
      headers: { ...jsonHeaders, 'stripe-signature': signed(body) }
    });
    assert.equal(res.status, 200);
    assert.equal(calls.userUpdate[0].data.plan, 'FREE');
  });
});

describe('error handling does not leak internals', () => {
  test('database errors surface as a generic 500', async () => {
    prisma.state.findMany = async () => {
      throw new Error('Invalid prisma.state.findMany() invocation: SELECT "public"."State"."id" FROM ... password authentication failed');
    };
    const res = await call('GET', '/api/v1/states', { headers: { 'x-api-key': apiKeys.good.key } });
    assert.equal(res.status, 500);
    assert.equal(res.json.message, 'Internal Server Error');
    assert.doesNotMatch(res.text, /SELECT|prisma|password|stack|\.js:/i);
  });

  test('malformed JSON body gives 400 without a stack trace', async () => {
    const res = await call('POST', '/api/auth/login', { raw: '{bad json', headers: { 'Content-Type': 'application/json' } });
    assert.equal(res.status, 400);
    assert.doesNotMatch(res.text, /at .*\.js/);
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await call('GET', '/api/nope');
    assert.equal(res.status, 404);
    assert.equal(res.json.success, false);
  });
});

describe('input validation', () => {
  const h = { 'x-api-key': apiKeys.good.key };

  test('search q is required, bounded and must be a single string', async () => {
    assert.equal((await call('GET', '/api/v1/villages/search', { headers: h })).status, 400);
    assert.equal((await call('GET', '/api/v1/villages/search?q=%20%20', { headers: h })).status, 400);
    assert.equal((await call('GET', `/api/v1/villages/search?q=${'a'.repeat(101)}`, { headers: h })).status, 400);
    assert.equal((await call('GET', '/api/v1/villages/search?q=a&q=b', { headers: h })).status, 400);
    assert.equal((await call('GET', '/api/v1/villages/search?q=patna', { headers: h })).status, 200);
  });

  test('pagination limit is capped at 100 and page is sanitised', async () => {
    let seen;
    prisma.village.findMany = async (a) => { seen = a; return []; };
    const res = await call('GET', '/api/v1/villages?limit=100000&page=-4', { headers: h });
    assert.equal(res.status, 200);
    assert.equal(res.json.limit, 100);
    assert.equal(res.json.page, 1);
    assert.equal(seen.take, 100);
  });

  test('array-valued stateCode does not crash (400)', async () => {
    const res = await call('GET', '/api/v1/districts?stateCode=1&stateCode=2', { headers: h });
    assert.equal(res.status, 400);
  });

  test('registration enforces password bounds', async () => {
    const short = await call('POST', '/api/auth/register', { body: { name: 'Al', email: 'a@b.co', password: 'short' } });
    assert.equal(short.status, 400);
    const long = await call('POST', '/api/auth/register', { body: { name: 'Al', email: 'a@b.co', password: 'x'.repeat(200) } });
    assert.equal(long.status, 400);
  });

  test('request bodies above 10kb are rejected', async () => {
    const res = await call('POST', '/api/auth/login', { body: { email: 'a@b.co', password: 'x'.repeat(20000) } });
    assert.equal(res.status, 413);
  });
});

describe('rate limiting', () => {
  test('free-plan user over the daily limit gets 429', async () => {
    prisma.apiLog.count = async () => 100;
    const res = await call('GET', '/api/v1/states', { headers: { 'x-api-key': apiKeys.good.key } });
    assert.equal(res.status, 429);
  });

  test('user under the limit passes', async () => {
    prisma.apiLog.count = async () => 99;
    const res = await call('GET', '/api/v1/states', { headers: { 'x-api-key': apiKeys.good.key } });
    assert.equal(res.status, 200);
  });

  test('auth limiter blocks bursts of credential attempts', async () => {
    const { createAuthLimiter } = await import('../src/middlewares/authLimiter.middleware.js');
    const limiter = createAuthLimiter({ windowMs: 60000, max: 3 });
    const results = [];
    for (let i = 0; i < 5; i++) {
      const res = { set() {}, status(c) { results.push(c); return { json() {} }; } };
      limiter({ ip: '1.2.3.4' }, res, () => results.push(200));
    }
    assert.deepEqual(results, [200, 200, 200, 429, 429]);
  });
});

describe('CORS', () => {
  test('preflight allows x-api-key and PATCH from a configured origin only', async () => {
    const ok = await call('OPTIONS', '/api/keys/1', {
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'x-api-key,authorization'
      }
    });
    assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(ok.headers.get('access-control-allow-methods'), /PATCH/);
    assert.match(ok.headers.get('access-control-allow-headers'), /x-api-key/i);

    const evil = await call('OPTIONS', '/api/keys/1', {
      headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' }
    });
    assert.equal(evil.headers.get('access-control-allow-origin'), null);
  });
});

describe('environment validation', () => {
  test('rejects missing, short and placeholder JWT secrets', async () => {
    const { validateEnv } = await import('../src/config/env.js');
    assert.throws(() => validateEnv({ DATABASE_URL: 'x' }), /JWT_SECRET/);
    assert.throws(() => validateEnv({ DATABASE_URL: 'x', JWT_SECRET: 'short' }), /at least 32/);
    assert.throws(() => validateEnv({ JWT_SECRET: 'a'.repeat(40) }), /DATABASE_URL/);
    assert.equal(validateEnv({ DATABASE_URL: 'x', JWT_SECRET: 'a'.repeat(40) }).PORT, 3000);
  });
});
