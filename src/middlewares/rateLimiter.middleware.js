import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import * as apiKeyService from '../services/apiKey.service.js';

const LIMITS = {
  FREE: 100,
  PRO: 10000,
  ADMIN: Infinity
};

/**
 * Middleware to enforce daily API rate limits based on user plan.
 */
export const rateLimiter = async (req, res, next) => {
  try {
    // 1. Determine authenticated user (from preceding auth middlewares or headers)
    if (!req.apiUser && req.headers['x-api-key']) {
      const apiKeyHeader = req.headers['x-api-key'];
      const apiKeyRecord = await apiKeyService.getApiKeyWithUser(apiKeyHeader);
      if (apiKeyRecord && apiKeyRecord.isActive && apiKeyRecord.user && apiKeyRecord.user.isActive) {
        req.apiUser = apiKeyRecord.user;
        req.apiKey = apiKeyRecord;
      }
    }

    if (!req.user && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (err) {
        // Ignore JWT verification issues; let the dedicated auth middleware handle 401
      }
    }

    const user = req.apiUser || req.user;
    if (!user) {
      // Unauthenticated request or public endpoint — skip rate limiting
      return next();
    }

    // 2. Check plan and role
    const plan = (user.plan || 'FREE').toUpperCase();
    const role = (user.role || 'USER').toUpperCase();

    if (plan === 'ADMIN' || role === 'ADMIN') {
      return next();
    }

    // Enforce limits (support custom override via env for testing)
    const freeLimit = process.env.RATE_LIMIT_FREE ? parseInt(process.env.RATE_LIMIT_FREE, 10) : LIMITS.FREE;
    const limit = plan === 'PRO' ? LIMITS.PRO : freeLimit;

    // 3. Count requests made today
    const userId = user.id || user.userId;
    if (!userId) {
      return next();
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const requestCount = await prisma.apiLog.count({
      where: {
        userId,
        createdAt: {
          gte: startOfToday
        }
      }
    });

    // 4. Enforce limits
    if (requestCount >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Daily API limit exceeded'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
