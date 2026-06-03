import prisma from '../config/prisma.js';

/**
 * Gets analytics summary from ApiLog.
 * Calculates total requests, requests created today, and unique api keys and users used.
 * 
 * @returns {Promise<object>} Analytics summary data object
 */
export const getAnalyticsSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalRequests, requestsToday, uniqueApiKeysGroup, uniqueUsersGroup] = await Promise.all([
    prisma.apiLog.count(),
    prisma.apiLog.count({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    }),
    prisma.apiLog.groupBy({
      by: ['apiKeyId'],
      where: {
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
        }
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
 * @returns {Promise<Array>} List of endpoint statistics
 */
export const getEndpointStats = async () => {
  const stats = await prisma.apiLog.groupBy({
    by: ['endpoint'],
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
 * @returns {Promise<object>} Status code counts map object
 */
export const getStatusCodeStats = async () => {
  const stats = await prisma.apiLog.groupBy({
    by: ['statusCode'],
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
 * @returns {Promise<Array>} List of daily usage stats sorted ascending by date
 */
export const getDailyStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // include today and 29 days before
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const logs = await prisma.apiLog.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
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
