import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { errorResponse } from '../utils/apiError.js';

const router = express.Router();

const requireAnalyticsAccess = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  const plan = req.user?.plan?.toUpperCase();

  if (role === 'ADMIN' || plan === 'PRO' || plan === 'ENTERPRISE') {
    return next();
  }
  return errorResponse(res, 'Upgrade to Pro for Advanced Analytics', 403);
};


// GET /api/analytics/summary - Get API request analytics summary
/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Fetch API request analytics summary
 *     description: Returns overall metrics including total request counts, requests today, and count of unique users and API keys.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Analytics summary fetched successfully
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
 *                     totalRequests:
 *                       type: integer
 *                       example: 150
 *                     requestsToday:
 *                       type: integer
 *                       example: 10
 *                     uniqueApiKeys:
 *                       type: integer
 *                       example: 3
 *                     uniqueUsers:
 *                       type: integer
 *                       example: 2
 */
router.get('/summary', authenticate, requireAnalyticsAccess, analyticsController.getSummary);

// GET /api/analytics/endpoints - Get API endpoint usage stats
/**
 * @swagger
 * /api/analytics/endpoints:
 *   get:
 *     summary: Fetch API endpoint usage statistics
 *     description: Returns a list of endpoint usage statistics, sorted descending by call frequency.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Endpoint usage statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       endpoint:
 *                         type: string
 *                         example: "/api/v1/villages"
 *                       count:
 *                         type: integer
 *                         example: 120
 */
router.get('/endpoints', authenticate, requireAnalyticsAccess, analyticsController.getEndpoints);

// GET /api/analytics/status-codes - Get API request status code stats
/**
 * @swagger
 * /api/analytics/status-codes:
 *   get:
 *     summary: Fetch HTTP status code statistics
 *     description: Returns a map of HTTP status codes to their respective request counts.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Status code statistics fetched successfully
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
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "200": 140
 *                     "400": 5
 *                     "401": 5
 */
router.get('/status-codes', authenticate, requireAnalyticsAccess, analyticsController.getStatusCodes);

// GET /api/analytics/daily - Get API request daily stats trend (last 30 days)
/**
 * @swagger
 * /api/analytics/daily:
 *   get:
 *     summary: Fetch daily request count trend
 *     description: Returns a daily log of request counts for the last 30 days, sorted chronologically ascending.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Daily request trend fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2026-06-01"
 *                       count:
 *                         type: integer
 *                         example: 12
 */
router.get('/daily', authenticate, requireAnalyticsAccess, analyticsController.getDaily);

export default router;
