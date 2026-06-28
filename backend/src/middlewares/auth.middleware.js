import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiError.js';
import prisma from '../config/prisma.js';

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header with Bearer token is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If it's a demo user, bypass database check and grant full access
    if (decoded.isDemo) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'USER',
        plan: decoded.plan || 'FREE',
        isAdmin: decoded.role === 'ADMIN',
        isDemo: true,
      };
      return next();
    }

    // Fetch latest user details from DB to avoid stale JWT claims
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, plan: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'User not found or inactive', 401);
    }

    // Attach the updated user payload to req.user
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};
