import express from 'express';
import * as systemController from '../controllers/system.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     summary: Fetch system statistics and environment information
 *     description: Retrieves details about the running Node environment, version, and uptime. (Requires authentication)
 *     tags:
 *       - System
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System information fetched successfully
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
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     nodeVersion:
 *                       type: string
 *                       example: "v20.19.4"
 *                     uptime:
 *                       type: number
 *                       example: 120.45
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 */
router.get('/info', authenticate, systemController.getSystemInfo);

export default router;
