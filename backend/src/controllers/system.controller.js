import prisma from '../config/prisma.js';
import redis from '../config/redis.js';

/**
 * Controller to handle fetching system info.
 */
export const getSystemInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  });
};

/**
 * Controller to fetch operator dashboard statistics.
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    // For demo users, return mock data without DB queries
    if (req.user?.isDemo) {
      return res.status(200).json({
        success: true,
        data: {
          totalUsers: 1247,
          activeSubscriptions: 89,
          proUsersCount: 67,
          networkTraffic: 45231,
          estimatedRevenue: 3283,
          health: {
            database: 'healthy',
            redis: 'healthy'
          }
        }
      });
    }

    const [totalUsers, activeSubs, proUsersCount, networkTraffic] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          plan: { in: ['PRO', 'ENTERPRISE'] }
        }
      }),
      prisma.user.count({
        where: {
          plan: 'PRO'
        }
      }),
      prisma.apiLog.count()
    ]);

    let databaseStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      databaseStatus = 'unhealthy';
    }

    try {
      await redis.get('health-check-ping');
    } catch (err) {
      redisStatus = 'unhealthy';
    }

    const estimatedRevenue = proUsersCount * 49;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions: activeSubs,
        proUsersCount,
        networkTraffic,
        estimatedRevenue,
        health: {
          database: databaseStatus,
          redis: redisStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
