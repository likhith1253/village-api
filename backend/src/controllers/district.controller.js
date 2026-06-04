import * as districtService from '../services/district.service.js';
import redis from '../config/redis.js';

/**
 * Controller to handle fetching districts for a given stateCode.
 * Checks Redis cache first (key: districts:<stateCode>).
 */
export const getDistricts = async (req, res, next) => {
  try {
    const { stateCode } = req.query;

    // Validation: stateCode is required
    if (!stateCode) {
      return res.status(400).json({
        success: false,
        message: 'stateCode is required'
      });
    }

    const cacheKey = `districts:${stateCode.toLowerCase()}`;
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
    const districts = await districtService.getDistrictsByState(stateCode);

    // Error Handling: State not found
    if (!districts) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    await redis.set(cacheKey, JSON.stringify(districts), { ex: 3600 });

    // Success response
    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    next(error);
  }
};
