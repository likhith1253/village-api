import * as stateService from '../services/state.service.js';
import redis from '../config/redis.js';

/**
 * Controller to handle fetching all states.
 * Checks Redis cache first (key: 'states').
 */
export const getAllStates = async (req, res, next) => {
  try {
    const cacheKey = 'states';
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('CACHE HIT');
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return res.status(200).json({
        success: true,
        count: data.length,
        data: data
      });
    }

    console.log('CACHE MISS');
    const states = await stateService.getAllStates();
    await redis.set(cacheKey, JSON.stringify(states), { ex: 3600 });

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    next(error);
  }
};
