import redis from '../config/redis.js';

/**
 * Cache helpers that never throw: a cache outage (Upstash down, network
 * error) must degrade to a database read, not a 500 for the caller.
 */
export const cacheGet = async (key) => {
  try {
    const cached = await redis.get(key);
    if (cached === null || cached === undefined) return null;
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (err) {
    console.warn('cache read failed:', err.message);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.warn('cache write failed:', err.message);
  }
};
