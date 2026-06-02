import * as apiKeyService from '../services/apiKey.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { errorResponse } from '../utils/apiError.js';

/**
 * Handles requests to generate a new API key.
 */
export const createKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    // Validate that API Key name exists
    if (!name) {
      return errorResponse(res, 'API Key name is required', 400);
    }

    // Call service to perform generation and database operations
    const apiKey = await apiKeyService.generateApiKey(userId, name);

    return successResponse(
      res,
      'API key created successfully',
      {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name
      },
      201
    );
  } catch (error) {
    next(error);
  }
};
