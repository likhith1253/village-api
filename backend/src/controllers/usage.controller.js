import * as usageService from '../services/usage.service.js';

/**
 * Controller to handle requests to fetch the current user's API usage summary.
 */
export const getUsage = async (req, res, next) => {
  try {
    const user = req.apiUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // For demo users, return mock data without DB queries
    if (user.isDemo) {
      return res.status(200).json({
        success: true,
        data: {
          totalRequests: 45231,
          requestsToday: 1234,
          requestsThisMonth: 8934,
          limit: 10000,
          limitType: 'daily',
          remaining: 8766,
          resetDate: new Date(Date.now() + 86400000).toISOString()
        }
      });
    }

    const userId = user.id || user.userId;
    const plan = (user.plan || 'FREE').toUpperCase();

    const usageData = await usageService.getUserUsage(userId, plan);

    return res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    next(error);
  }
};
