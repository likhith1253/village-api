import * as stateService from '../services/state.service.js';
import { cacheGet, cacheSet } from '../utils/cache.js';

/**
 * Controller to handle fetching all states.
 * Checks Redis cache first (key: 'states').
 */
export const getAllStates = async (req, res, next) => {
  try {
    const cacheKey = 'states';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached
      });
    }

    const states = await stateService.getAllStates();
    await cacheSet(cacheKey, states);

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    next(error);
  }
};
