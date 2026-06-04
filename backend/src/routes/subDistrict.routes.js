import express from 'express';
import * as subDistrictController from '../controllers/subDistrict.controller.js';

const router = express.Router();

// GET /api/v1/subdistricts?districtCode=XXX - Fetch sub-districts for districtCode
/**
 * @swagger
 * /api/v1/subdistricts:
 *   get:
 *     summary: Fetch sub-districts by district code
 *     description: Retrieves a list of sub-districts belonging to a district by its districtCode, sorted alphabetically by name.
 *     tags:
 *       - Geographic APIs
 *     parameters:
 *       - in: query
 *         name: districtCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique district code
 *         example: AP01
 *     responses:
 *       200:
 *         description: List of sub-districts fetched successfully
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
 *                   example: 50
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       subDistrictCode:
 *                         type: string
 *                         example: 05448
 *                       name:
 *                         type: string
 *                         example: Agali
 *       400:
 *         description: Bad request (districtCode is required)
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
 *                   example: districtCode is required
 *       404:
 *         description: District not found
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
 *                   example: District not found
 */
router.get('/', subDistrictController.getSubDistricts);

export default router;
