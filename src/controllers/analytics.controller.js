import * as analyticsService from '../services/analytics.service.js';

/**
 * Controller to handle fetching the API network analytics summary.
 */
export const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getAnalyticsSummary();

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
    const stats = await analyticsService.getEndpointStats();

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
    const stats = await analyticsService.getStatusCodeStats();

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
    const stats = await analyticsService.getDailyStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
