import express from 'express';
import * as billingController from '../controllers/billing.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkout', authenticate, billingController.createCheckoutSession);

export default router;
