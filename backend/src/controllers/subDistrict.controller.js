import * as subDistrictService from '../services/subDistrict.service.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { queryString } from '../utils/query.js';

/**
 * Controller to handle fetching sub-districts for a given districtCode.
 * Checks Redis cache first (key: subdistricts:<districtCode>).
 */
export const getSubDistricts = async (req, res, next) => {
  try {
    const districtCode = queryString(req.query.districtCode);

    // Validation: districtCode is required
    if (!districtCode) {
      return res.status(400).json({
        success: false,
        message: 'districtCode is required'
      });
    }

    const cacheKey = `subdistricts:${districtCode.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached
      });
    }

    const subDistricts = await subDistrictService.getSubDistrictsByDistrict(districtCode);

    // Error Handling: District not found
    if (!subDistricts) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    await cacheSet(cacheKey, subDistricts);

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
