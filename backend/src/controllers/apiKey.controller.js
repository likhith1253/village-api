import * as apiKeyService from '../services/apiKey.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { errorResponse } from '../utils/apiError.js';

export const createKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    if (!name) {
      return errorResponse(res, 'API Key name is required', 400);
    }

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

export const getKeys = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const keys = await apiKeyService.getKeysByUser(userId);
    return successResponse(res, 'API keys retrieved successfully', keys, 200);
  } catch (error) {
    next(error);
  }
};

export const updateKey = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { id } = req.params;
    const { name, isActive } = req.body;

    const updatedKey = await apiKeyService.updateApiKey(parseInt(id, 10), userId, { name, isActive });
    return successResponse(res, 'API key updated successfully', updatedKey, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const deleteKey = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { id } = req.params;
    await apiKeyService.deleteApiKey(parseInt(id, 10), userId);
    return successResponse(res, 'API key revoked successfully', null, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};
