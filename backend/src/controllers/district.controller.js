import * as districtService from '../services/district.service.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { queryString } from '../utils/query.js';

/**
 * Controller to handle fetching districts for a given stateCode.
 * Checks Redis cache first (key: districts:<stateCode>).
 */
export const getDistricts = async (req, res, next) => {
  try {
    const stateCode = queryString(req.query.stateCode);

    // Validation: stateCode is required
    if (!stateCode) {
      return res.status(400).json({
        success: false,
        message: 'stateCode is required'
      });
    }

    const cacheKey = `districts:${stateCode.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached
      });
    }

    const districts = await districtService.getDistrictsByState(stateCode);

    // Error Handling: State not found
    if (!districts) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

    await cacheSet(cacheKey, districts);

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
