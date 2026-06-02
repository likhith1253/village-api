import * as stateService from '../services/state.service.js';

export const getAllStates = async (req, res) => {
  try {
    const result = await stateService.getAllStates();
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
