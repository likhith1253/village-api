import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validation.middleware.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

export default router;
