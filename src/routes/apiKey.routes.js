import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as apiKeyController from '../controllers/apiKey.controller.js';

const router = express.Router();

// POST /api/keys - Generate a secure API Key
/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Generate a secure API Key
 *     description: Generates a new API key for the authenticated user to access geographic data.
 *     tags:
 *       - API Keys
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Application Key
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API key created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     key:
 *                       type: string
 *                       example: vlg_7a1e3b...
 *                     name:
 *                       type: string
 *                       example: My Application Key
 *       400:
 *         description: Bad request (missing name)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: API Key name is required
 *       401:
 *         description: Unauthorized (missing or invalid bearer token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access token required
 */
router.post('/', authenticate, apiKeyController.createKey);

export default router;
