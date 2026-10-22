import * as villageService from '../services/village.service.js';
import { cacheGet, cacheSet } from '../utils/cache.js';
import { queryString, MAX_SEARCH_LENGTH } from '../utils/query.js';

/**
 * Controller to handle village name search.
 * Checks Redis cache first (key: villagesearch:<q>).
 */
export const searchVillages = async (req, res, next) => {
  try {
    const q = queryString(req.query.q, MAX_SEARCH_LENGTH);

    // Validation: q is required and capped to keep cache keys and LIKE scans bounded
    if (q === undefined) {
      return res.status(400).json({
        success: false,
        message: `search query is required (1-${MAX_SEARCH_LENGTH} characters)`
      });
    }

    const cacheKey = `villagesearch:${q.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached
      });
    }

    const villages = await villageService.searchVillagesByName(q);
    await cacheSet(cacheKey, villages);

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
    const villageCode = queryString(req.params.villageCode);
    if (villageCode === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid villageCode' });
    }

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
    const stateCode = queryString(req.query.stateCode);
    const districtCode = queryString(req.query.districtCode);
    const subDistrictCode = queryString(req.query.subDistrictCode);

    // Parse and validate page query param (default: 1)
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    } else if (page > 1000000) {
      page = 1000000;
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
