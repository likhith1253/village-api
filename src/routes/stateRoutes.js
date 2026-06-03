import express from 'express';
import * as stateController from '../controllers/stateController.js';

const router = express.Router();

// Define route for fetching states
/**
 * @swagger
 * /api/v1/states:
 *   get:
 *     summary: Fetch all states
 *     description: Retrieves a list of all states sorted alphabetically by name.
 *     tags:
 *       - Geographic APIs
 *     responses:
 *       200:
 *         description: List of states fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 36
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Andhra Pradesh
 *                       stateCode:
 *                         type: string
 *                         example: AP
 */
router.get('/', stateController.getAllStates);

export default router;
