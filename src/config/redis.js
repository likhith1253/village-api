import { Redis } from '@upstash/redis';

let redisClient;

const isConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (isConfigured) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('⚠️ Upstash Redis env vars missing. Using in-memory fallback cache.');
  const store = new Map();
  const ttls = new Map();

  redisClient = {
    get: async (key) => {
      const now = Date.now();
      if (ttls.has(key) && ttls.get(key) < now) {
        store.delete(key);
        ttls.delete(key);
        return null;
      }
      const val = store.get(key);
      return val !== undefined ? JSON.parse(val) : null;
    },
    set: async (key, value, options) => {
      store.set(key, JSON.stringify(value));
      if (options && options.ex) {
        ttls.set(key, Date.now() + options.ex * 1000);
      }
      return 'OK';
    }
  };
}

export default redisClient;
