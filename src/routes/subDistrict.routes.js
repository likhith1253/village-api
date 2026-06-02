import express from 'express';
import * as subDistrictController from '../controllers/subDistrict.controller.js';

const router = express.Router();

// GET /api/v1/subdistricts?districtCode=XXX - Fetch sub-districts for districtCode
router.get('/', subDistrictController.getSubDistricts);

export default router;
