import express from 'express';
import * as districtController from '../controllers/district.controller.js';

const router = express.Router();

// GET /api/v1/districts?stateCode=XX - Fetch districts for stateCode
router.get('/', districtController.getDistricts);

export default router;
