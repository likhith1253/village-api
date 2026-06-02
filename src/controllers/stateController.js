import * as stateService from '../services/stateService.js';

/**
 * Controller to handle fetching all states.
 * Calls stateService, formats response as:
 * {
 *   success: true,
 *   count: number,
 *   data: [...]
 * }
 */
export const getAllStates = async (req, res, next) => {
  try {
    const states = await stateService.getAllStates();
    return res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    next(error);
  }
};
