import * as subDistrictService from '../services/subDistrict.service.js';

/**
 * Controller to handle fetching sub-districts for a given districtCode.
 * Performs validation and calls subDistrictService.
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

    const subDistricts = await subDistrictService.getSubDistrictsByDistrict(districtCode);

    // Error Handling: District not found
    if (!subDistricts) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

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
