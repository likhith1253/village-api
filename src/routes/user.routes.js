import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { profileUpdateSchema, passwordUpdateSchema } from '../utils/validation.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateBody(profileUpdateSchema), userController.updateProfile);
router.put('/password', authenticate, validateBody(passwordUpdateSchema), userController.updatePassword);

export default router;
