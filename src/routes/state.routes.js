import express from 'express';
import * as stateController from '../controllers/state.controller.js';

const router = express.Router();

router.get('/', stateController.getAllStates);

export default router;
