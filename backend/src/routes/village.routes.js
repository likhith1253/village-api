import express from 'express';
import * as villageController from '../controllers/village.controller.js';

const router = express.Router();

// GET /api/v1/villages - Get filtered and paginated list of villages
/**
 * @swagger
 * /api/v1/villages:
 *   get:
 *     summary: Fetch filtered and paginated list of villages
 *     description: Retrieves a list of villages, optionally filtered by stateCode, districtCode, and subDistrictCode. Supports pagination.
 *     tags:
 *       - Geographic APIs
 *     parameters:
 *       - in: query
 *         name: stateCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by state code
 *         example: AP
 *       - in: query
 *         name: districtCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by district code
 *         example: AP01
 *       - in: query
 *         name: subDistrictCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by sub-district code
 *         example: 05448
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         required: false
 *         description: Number of records to return per page (max 100)
 *         example: 50
 *     responses:
 *       200:
 *         description: List of villages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 50
 *                 count:
 *                   type: integer
 *                   example: 1000
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       villageCode:
 *                         type: string
 *                         example: "622345"
 *                       name:
 *                         type: string
 *                         example: "Agali"
 */
router.get('/', villageController.getVillages);

// GET /api/v1/villages/search - Search villages by name
/**
 * @swagger
 * /api/v1/villages/search:
 *   get:
 *     summary: Search villages by name
 *     description: Searches for villages using a partial, case-insensitive match on the name. Returns a maximum of 20 matches.
 *     tags:
 *       - Geographic APIs
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The name query to search for
 *         example: Agali
 *     responses:
 *       200:
 *         description: Search results fetched successfully
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
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       villageCode:
 *                         type: string
 *                         example: "622345"
 *                       name:
 *                         type: string
 *                         example: "Agali"
 *       400:
 *         description: Bad request (q parameter missing)
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
 *                   example: search query is required
 */
router.get('/search', villageController.searchVillages);

// GET /api/v1/villages/:villageCode - Fetch village by villageCode
/**
 * @swagger
 * /api/v1/villages/{villageCode}:
 *   get:
 *     summary: Fetch village by its code
 *     description: Retrieves details of a single village including its full geographic parent hierarchy.
 *     tags:
 *       - Geographic APIs
 *     parameters:
 *       - in: path
 *         name: villageCode
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique village code
 *         example: "622345"
 *     responses:
 *       200:
 *         description: Village details fetched successfully
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
 *                     villageCode:
 *                       type: string
 *                       example: "622345"
 *                     villageName:
 *                       type: string
 *                       example: "Agali"
 *                     state:
 *                       type: string
 *                       example: "Andhra Pradesh"
 *                     district:
 *                       type: string
 *                       example: "Anantapur"
 *                     subDistrict:
 *                       type: string
 *                       example: "Agali"
 *                     fullAddress:
 *                       type: string
 *                       example: "Agali, Agali, Anantapur, Andhra Pradesh"
 *       404:
 *         description: Village not found
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
 *                   example: Village not found
 */
router.get('/:villageCode', villageController.getVillageByCode);

export default router;
