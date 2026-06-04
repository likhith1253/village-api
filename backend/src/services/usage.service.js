import prisma from '../config/prisma.js';

const LIMITS = {
  FREE: 100,
  PRO: 10000,
  ADMIN: Infinity
};

/**
 * Calculates current request count and remaining requests today for a user.
 * 
 * @param {number} userId 
 * @param {string} plan 
 * @returns {Promise<object>} Usage data
 */
export const getUserUsage = async (userId, plan) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const requestsToday = await prisma.apiLog.count({
    where: {
      userId,
      createdAt: {
        gte: startOfToday
      }
    }
  });

  const dailyLimit = LIMITS[plan] || LIMITS.FREE;

  if (dailyLimit === Infinity) {
    return {
      userId,
      plan,
      requestsToday,
      dailyLimit: null,
      remaining: null
    };
  }

  const remaining = Math.max(0, dailyLimit - requestsToday);

  return {
    userId,
    plan,
    requestsToday,
    dailyLimit,
    remaining
  };
};
