import express from 'express';
import * as villageController from '../controllers/village.controller.js';

const router = express.Router();

// GET /api/v1/villages - Get filtered and paginated list of villages
router.get('/', villageController.getVillages);

// GET /api/v1/villages/search - Search villages by name
router.get('/search', villageController.searchVillages);

// GET /api/v1/villages/:villageCode - Fetch village by villageCode
router.get('/:villageCode', villageController.getVillageByCode);

export default router;
