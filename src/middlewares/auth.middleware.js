import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiError.js';

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header with Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload to req.user
    req.user = decoded;
    
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};
