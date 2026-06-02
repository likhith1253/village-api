import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as apiKeyController from '../controllers/apiKey.controller.js';

const router = express.Router();

// POST /api/keys - Generate a secure API Key
router.post('/', authenticate, apiKeyController.createKey);

export default router;
