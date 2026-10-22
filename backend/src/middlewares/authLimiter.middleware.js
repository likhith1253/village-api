/**
 * Small in-memory fixed-window limiter for credential endpoints
 * (login / register / demo-login) to slow down brute force and signup spam.
 * State is per process; behind multiple instances each keeps its own window.
 */
export const createAuthLimiter = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  const hits = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref?.();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Too many attempts, please try again later' });
    }
    return next();
  };
};
