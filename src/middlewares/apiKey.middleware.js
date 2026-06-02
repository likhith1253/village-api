import { errorResponse } from '../utils/apiError.js';
import * as apiKeyService from '../services/apiKey.service.js';

/**
 * Middleware to authenticate requests using an API Key.
 */
export const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers['x-api-key'];

    // 1. Check if header is missing
    if (!apiKeyHeader) {
      return errorResponse(res, 'API key required', 401);
    }

    // 2. Find API Key with associated user
    const apiKeyRecord = await apiKeyService.getApiKeyWithUser(apiKeyHeader);

    // 3. Check if API key exists
    if (!apiKeyRecord) {
      return errorResponse(res, 'Invalid API key', 401);
    }

    // 4. Check if key is active
    if (!apiKeyRecord.isActive) {
      return errorResponse(res, 'API key is inactive', 403);
    }

    const associatedUser = apiKeyRecord.user;

    // 5. Check if user is active
    if (!associatedUser || !associatedUser.isActive) {
      return errorResponse(res, 'User account inactive', 403);
    }

    // 6. Attach properties to request object
    req.apiKey = apiKeyRecord;
    req.apiUser = associatedUser;

    next();
  } catch (error) {
    next(error);
  }
};
