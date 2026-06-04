import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authenticateApiKey } from '../middlewares/apiKey.middleware.js';
import * as usageController from '../controllers/usage.controller.js';

const router = express.Router();

// Helper middleware to authenticate either via API key or JWT token.
const authenticateUser = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  } else if (req.headers['x-api-key']) {
    return authenticateApiKey(req, res, next);
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access token or API key required'
    });
  }
};

/**
 * @swagger
 * /api/usage/me:
 *   get:
 *     summary: Fetch current user usage metrics
 *     description: Retrieves the request usage summary of the authenticated user for the current day.
 *     tags:
 *       - Usage
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Usage metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     plan:
 *                       type: string
 *                       example: FREE
 *                     requestsToday:
 *                       type: integer
 *                       example: 45
 *                     dailyLimit:
 *                       type: integer
 *                       nullable: true
 *                       example: 100
 *                     remaining:
 *                       type: integer
 *                       nullable: true
 *                       example: 55
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateUser, usageController.getUsage);

export default router;
