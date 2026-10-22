import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { apiKeyCreateSchema, apiKeyUpdateSchema } from '../utils/validation.js';
import * as apiKeyController from '../controllers/apiKey.controller.js';

const router = express.Router();

router.post('/', authenticate, validateBody(apiKeyCreateSchema), apiKeyController.createKey);
router.get('/', authenticate, apiKeyController.getKeys);
router.patch('/:id', authenticate, validateBody(apiKeyUpdateSchema), apiKeyController.updateKey);
router.delete('/:id', authenticate, apiKeyController.deleteKey);

export default router;
