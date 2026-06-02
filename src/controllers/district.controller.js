import * as districtService from '../services/district.service.js';

/**
 * Controller to handle fetching districts for a given stateCode.
 * Performs validation and calls districtService.
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

    const districts = await districtService.getDistrictsByState(stateCode);

    // Error Handling: State not found
    if (!districts) {
      return res.status(404).json({
        success: false,
        message: 'State not found'
      });
    }

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
