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
