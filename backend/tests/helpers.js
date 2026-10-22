// Shared test harness: boots the real Express app on an ephemeral port with
// Prisma delegates replaced by in-memory fakes (no database or network).
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-0123456789';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_for_unit_tests';
process.env.NODE_ENV = 'test';
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.RATE_LIMIT_FREE;

import jwt from 'jsonwebtoken';

const { default: app } = await import('../src/app.js');
export const { default: prisma } = await import('../src/config/prisma.js');

export const users = {
  free: { id: 1, email: 'free@test.dev', role: 'USER', plan: 'FREE', isActive: true },
  pro: { id: 2, email: 'pro@test.dev', role: 'USER', plan: 'PRO', isActive: true },
  admin: { id: 3, email: 'admin@test.dev', role: 'ADMIN', plan: 'FREE', isActive: true }
};

export const sign = (user, opts = {}, secret = process.env.JWT_SECRET) =>
  jwt.sign({ userId: user.id, email: user.email, role: user.role, plan: user.plan }, secret, {
    expiresIn: '1h',
    ...opts
  });

export const bearer = (user) => ({ Authorization: `Bearer ${sign(user)}` });

export const apiKeys = {
  good: { id: 10, key: 'vap_good', isActive: true, userId: 1, user: users.free },
  inactive: { id: 11, key: 'vap_off', isActive: false, userId: 1, user: users.free }
};

// Default fakes; individual tests may override and are reset in resetFakes().
export const calls = { updateMany: [], userUpdate: [], groupBy: [], keyDelete: [], apiLogCreate: [] };

export function resetFakes() {
  for (const k of Object.keys(calls)) calls[k] = [];
  const all = Object.values(users);
  prisma.user.findUnique = async ({ where }) => all.find((u) => u.id === where.id) || null;
  prisma.user.findFirst = async () => null;
  prisma.user.update = async (args) => { calls.userUpdate.push(args); return {}; };
  prisma.user.updateMany = async (args) => { calls.updateMany.push(args); return { count: 1 }; };
  prisma.apiKey.findUnique = async ({ where }) =>
    Object.values(apiKeys).find((k) => k.key === where.key) || null;
  prisma.apiKey.findMany = async () => [];
  prisma.apiKey.findFirst = async ({ where }) =>
    where.id === 10 && where.userId === 1 ? { id: 10, userId: 1 } : null;
  prisma.apiKey.update = async () => ({ id: 10, key: 'vap_good', name: 'n', isActive: true });
  prisma.apiKey.delete = async (a) => { calls.keyDelete.push(a); };
  prisma.apiLog.count = async () => 0;
  prisma.apiLog.create = async (a) => { calls.apiLogCreate.push(a); return {}; };
  prisma.apiLog.groupBy = async (a) => { calls.groupBy.push(a); return []; };
  prisma.apiLog.findMany = async () => [];
  prisma.state.findMany = async () => [{ id: 1, name: 'Bihar', stateCode: '10' }];
  prisma.village.findMany = async () => [];
  prisma.village.count = async () => 0;
}

let server;
let base;
export async function start() {
  resetFakes();
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
  return base;
}
export async function stop() {
  await new Promise((resolve) => server.close(resolve));
}

export async function call(method, path, { headers = {}, body, raw } = {}) {
  const init = { method, headers: { ...headers } };
  if (raw !== undefined) {
    init.body = raw;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(base + path, init);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, json, text, headers: res.headers };
}
