import * as userService from '../services/user.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { errorResponse } from '../utils/apiError.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const profile = await userService.getUserProfile(userId);
    return successResponse(res, 'User profile retrieved successfully', profile, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { name, email } = req.body;
    const updatedUser = await userService.updateUserProfile(userId, { name, email });
    return successResponse(res, 'Profile updated successfully', updatedUser, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    const { currentPassword, newPassword } = req.body;
    await userService.updateUserPassword(userId, currentPassword, newPassword);
    return successResponse(res, 'Password updated successfully', null, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};
