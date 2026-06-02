import express from 'express';
import * as stateController from '../controllers/stateController.js';

const router = express.Router();

// Define route for fetching states
router.get('/', stateController.getAllStates);

export default router;
