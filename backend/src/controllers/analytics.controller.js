import * as analyticsService from '../services/analytics.service.js';

/**
 * Controller to handle fetching the API network analytics summary.
 */
export const getSummary = async (req, res, next) => {
  try {
    // For demo users, return mock data without DB queries
    if (req.user?.isDemo) {
      console.log('[DIAGNOSTIC - DEMO ANALYTICS SUMMARY RETURNED]');
      return res.status(200).json({
        success: true,
        data: {
          totalRequests: 45231,
          successfulRequests: 42156,
          failedRequests: 3075,
          successRate: 93.2,
          avgResponseTime: 245
        }
      });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin ? null : req.user?.userId;
    const summary = await analyticsService.getAnalyticsSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching endpoint usage statistics.
 */
export const getEndpoints = async (req, res, next) => {
  try {
    // For demo users, return mock data without DB queries
    if (req.user?.isDemo) {
      console.log('[DIAGNOSTIC - DEMO ANALYTICS ENDPOINTS RETURNED]');
      return res.status(200).json({
        success: true,
        data: [
          { endpoint: '/api/v1/states', count: 15234, avgResponseTime: 180 },
          { endpoint: '/api/v1/districts', count: 12456, avgResponseTime: 220 },
          { endpoint: '/api/v1/villages', count: 8934, avgResponseTime: 310 },
          { endpoint: '/api/v1/subdistricts', count: 8607, avgResponseTime: 270 }
        ]
      });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin ? null : req.user?.userId;
    const stats = await analyticsService.getEndpointStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching status code usage statistics.
 */
export const getStatusCodes = async (req, res, next) => {
  try {
    // For demo users, return mock data without DB queries
    if (req.user?.isDemo) {
      console.log('[DIAGNOSTIC - DEMO ANALYTICS STATUS CODES RETURNED]');
      return res.status(200).json({
        success: true,
        data: {
          200: 42156,
          400: 1200,
          401: 850,
          404: 450,
          429: 275,
          500: 300
        }
      });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin ? null : req.user?.userId;
    const stats = await analyticsService.getStatusCodeStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching daily request counts.
 */
export const getDaily = async (req, res, next) => {
  try {
    // For demo users, return mock data without DB queries
    if (req.user?.isDemo) {
      console.log('[DIAGNOSTIC - DEMO ANALYTICS DAILY RETURNED]');
      return res.status(200).json({
        success: true,
        data: [
          { date: '2026-05-27', count: 1120 },
          { date: '2026-05-28', count: 1250 },
          { date: '2026-05-29', count: 1380 },
          { date: '2026-05-30', count: 1420 },
          { date: '2026-05-31', count: 1560 },
          { date: '2026-06-01', count: 1640 },
          { date: '2026-06-02', count: 1710 },
          { date: '2026-06-03', count: 1820 },
          { date: '2026-06-04', count: 1980 },
          { date: '2026-06-05', count: 2120 }
        ]
      });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin ? null : req.user?.userId;
    const stats = await analyticsService.getDailyStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
