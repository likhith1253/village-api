import * as analyticsService from '../services/analytics.service.js';

/**
 * Controller to handle fetching the API network analytics summary.
 */
export const getSummary = async (req, res, next) => {
  try {
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
