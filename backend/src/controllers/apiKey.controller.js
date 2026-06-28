import * as apiKeyService from '../services/apiKey.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { errorResponse } from '../utils/apiError.js';

export const createKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;
    const isDemo = req.user?.isDemo;

    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    if (!name) {
      return errorResponse(res, 'API Key name is required', 400);
    }

    // For demo users, generate a mock API key without DB operations
    if (isDemo) {
      const mockKey = {
        id: `demo-key-${Date.now()}`,
        key: `vap_demo_${Math.random().toString(36).substring(2, 22)}`,
        name: name,
        userId: 'demo-user-123',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          apiLogs: 0,
        },
      };
      return successResponse(
        res,
        'API key created successfully',
        {
          id: mockKey.id,
          key: mockKey.key,
          name: mockKey.name
        },
        201
      );
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
    const { userId, isDemo } = req.user;

    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    // For demo users, return multiple mock API keys to prevent DB errors
    if (isDemo) {
      const mockKeys = [
        {
          id: 'demo-key-1',
          key: `vap_demo_${'a'.repeat(20)}}`,
          name: 'Demo Production Key',
          userId: 'demo-user-123',
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            apiLogs: 5,
          },
        },
        {
          id: 'demo-key-2',
          key: `vap_demo_${'b'.repeat(20)}}`,
          name: 'Demo Testing Key',
          userId: 'demo-user-123',
          isActive: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            apiLogs: 3,
          },
        },
        {
          id: 'demo-key-3',
          key: `vap_demo_${'c'.repeat(20)}}`,
          name: 'Demo Development Key',
          userId: 'demo-user-123',
          isActive: false,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          _count: {
            apiLogs: 2,
          },
        },
      ];
      return successResponse(res, 'API keys retrieved successfully', mockKeys, 200);
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
    const isDemo = req.user?.isDemo;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { id } = req.params;
    const { name, isActive } = req.body;

    // For demo users, return mock updated key without DB operations
    if (isDemo) {
      return successResponse(res, 'API key updated successfully', { id, name, isActive }, 200);
    }

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
    const isDemo = req.user?.isDemo;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { id } = req.params;

    // For demo users, return mock success without DB operations
    if (isDemo) {
      return successResponse(res, 'API key revoked successfully', null, 200);
    }

    await apiKeyService.deleteApiKey(parseInt(id, 10), userId);
    return successResponse(res, 'API key revoked successfully', null, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};
