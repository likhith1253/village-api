import prisma from '../config/prisma.js';

/**
 * Gets analytics summary from ApiLog.
 * Calculates total requests, requests created today, and unique api keys and users used.
 * 
 * @returns {Promise<object>} Analytics summary data object
 */
export const getAnalyticsSummary = async (userId = null) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const whereClause = userId ? { userId } : {};

  const [totalRequests, requestsToday, uniqueApiKeysGroup, uniqueUsersGroup] = await Promise.all([
    prisma.apiLog.count({ where: whereClause }),
    prisma.apiLog.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: startOfToday
        }
      }
    }),
    prisma.apiLog.groupBy({
      by: ['apiKeyId'],
      where: {
        ...whereClause,
        apiKeyId: {
          not: null
        }
      }
    }),
    prisma.apiLog.groupBy({
      by: ['userId'],
      where: {
        userId: {
          not: null
        },
        ...whereClause
      }
    })
  ]);

  return {
    totalRequests,
    requestsToday,
    uniqueApiKeys: uniqueApiKeysGroup.length,
    uniqueUsers: uniqueUsersGroup.length
  };
};

/**
 * Gets endpoint usage statistics by grouping and counting requests.
 * Sorts descending by count.
 * 
 * @param {number|null} userId Optional filter
 * @returns {Promise<Array>} List of endpoint statistics
 */
export const getEndpointStats = async (userId = null) => {
  const whereClause = userId ? { where: { userId } } : {};
  const stats = await prisma.apiLog.groupBy({
    by: ['endpoint'],
    ...whereClause,
    _count: {
      id: true
    }
  });

  return stats
    .map(s => ({
      endpoint: s.endpoint,
      count: s._count.id
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Gets status code usage statistics by grouping and counting requests.
 * Formats response as an object with status code as key and count as value.
 * 
 * @param {number|null} userId Optional filter
 * @returns {Promise<object>} Status code counts map object
 */
export const getStatusCodeStats = async (userId = null) => {
  const whereClause = userId ? { where: { userId } } : {};
  const stats = await prisma.apiLog.groupBy({
    by: ['statusCode'],
    ...whereClause,
    _count: {
      id: true
    }
  });

  const formattedStats = {};
  stats.forEach(s => {
    formattedStats[String(s.statusCode)] = s._count.id;
  });

  return formattedStats;
};

/**
 * Gets daily API usage stats for the last 30 days.
 * 
 * @param {number|null} userId Optional filter
 * @returns {Promise<Array>} List of daily usage stats sorted ascending by date
 */
export const getDailyStats = async (userId = null) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today and 29 days before
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const whereClause = {
    createdAt: {
      gte: thirtyDaysAgo
    },
    ...(userId ? { userId } : {})
  };

  const logs = await prisma.apiLog.findMany({
    where: whereClause,
    select: {
      createdAt: true
    }
  });

  const dailyCounts = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
  }

  logs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    if (dailyCounts[dateStr] !== undefined) {
      dailyCounts[dateStr]++;
    }
  });

  return Object.keys(dailyCounts)
    .sort()
    .map(date => ({
      date,
      count: dailyCounts[date]
    }));
};
