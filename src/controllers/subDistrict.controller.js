import * as subDistrictService from '../services/subDistrict.service.js';
import redis from '../config/redis.js';

/**
 * Controller to handle fetching sub-districts for a given districtCode.
 * Checks Redis cache first (key: subdistricts:<districtCode>).
 */
export const getSubDistricts = async (req, res, next) => {
  try {
    const { districtCode } = req.query;

    // Validation: districtCode is required
    if (!districtCode) {
      return res.status(400).json({
        success: false,
        message: 'districtCode is required'
      });
    }

    const cacheKey = `subdistricts:${districtCode.toLowerCase()}`;
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
    const subDistricts = await subDistrictService.getSubDistrictsByDistrict(districtCode);

    // Error Handling: District not found
    if (!subDistricts) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    await redis.set(cacheKey, JSON.stringify(subDistricts), { ex: 3600 });

    // Success response
    return res.status(200).json({
      success: true,
      count: subDistricts.length,
      data: subDistricts
    });
  } catch (error) {
    next(error);
  }
};
