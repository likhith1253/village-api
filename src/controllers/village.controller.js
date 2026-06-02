import * as villageService from '../services/village.service.js';

/**
 * Controller to handle village name search.
 * Performs query parameter validation and formats the response.
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

    const villages = await villageService.searchVillagesByName(q.trim());

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
