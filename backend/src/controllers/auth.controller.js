import jwt from 'jsonwebtoken';
import * as userService from '../services/user.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { errorResponse } from '../utils/apiError.js';

/**
 * Handles user registration request.
 */
export const register = async (req, res, next) => {
  console.log('REGISTER_CONTROLLER_ENTERED');
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 'All fields are required', 400);
    }

    // Call service to handle business logic
    await userService.createUser(name, email, password);

    console.log('REGISTER_CONTROLLER_EXITED');
    // Return success response
    return successResponse(res, 'User registered successfully', null, 201);
  } catch (error) {
    console.error('REGISTER_CONTROLLER_ERROR', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    // Pass unexpected errors to the global error handler
    next(error);
  }
};

/**
 * Handles user login request.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Missing fields', 400);
    }

    const user = await userService.loginUser(email, password);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    }, 200);
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
};
