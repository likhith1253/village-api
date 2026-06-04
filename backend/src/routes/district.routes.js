import express from 'express';
import * as districtController from '../controllers/district.controller.js';

const router = express.Router();

// GET /api/v1/districts?stateCode=XX - Fetch districts for stateCode
/**
 * @swagger
 * /api/v1/districts:
 *   get:
 *     summary: Fetch districts by state code
 *     description: Retrieves a list of districts belonging to a state by its stateCode, sorted alphabetically by name.
 *     tags:
 *       - Geographic APIs
 *     parameters:
 *       - in: query
 *         name: stateCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique state code
 *         example: AP
 *     responses:
 *       200:
 *         description: List of districts fetched successfully
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
 *                   example: 13
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
 *                         example: Anantapur
 *                       districtCode:
 *                         type: string
 *                         example: AP01
 *       400:
 *         description: Bad request (stateCode is required)
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
 *                   example: stateCode is required
 *       404:
 *         description: State not found
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
 *                   example: State not found
 */
router.get('/', districtController.getDistricts);

export default router;
