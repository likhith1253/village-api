import * as villageService from '../services/village.service.js';
import redis from '../config/redis.js';

/**
 * Controller to handle village name search.
 * Checks Redis cache first (key: villagesearch:<q>).
 */
export const searchVillages = async (req, res, next) => {
  try {
    const { q } = req.query;

    // Validation: q is required
    if (q === undefined || q === null || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'search query is required'
      });
    }

    const queryStr = q.trim().toLowerCase();
    const cacheKey = `villagesearch:${queryStr}`;
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
    const villages = await villageService.searchVillagesByName(q.trim());
    await redis.set(cacheKey, JSON.stringify(villages), { ex: 3600 });

    return res.status(200).json({
      success: true,
      count: villages.length,
      data: villages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching a single village by its villageCode.
 */
export const getVillageByCode = async (req, res, next) => {
  try {
    const { villageCode } = req.params;

    const village = await villageService.getVillageByCode(villageCode);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: 'Village not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: village
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching a filtered and paginated list of villages.
 */
export const getVillages = async (req, res, next) => {
  try {
    const { stateCode, districtCode, subDistrictCode } = req.query;

    // Parse and validate page query param (default: 1)
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // Parse and validate limit query param (default: 50, max: 100)
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) {
      limit = 50;
    } else if (limit > 100) {
      limit = 100;
    }

    const { total, data } = await villageService.getVillages({
      stateCode,
      districtCode,
      subDistrictCode,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: total,
      data
    });
  } catch (error) {
    next(error);
  }
};
