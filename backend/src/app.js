import express from 'express';
import authRoutes from './routes/auth.routes.js';
import apiKeyRoutes from './routes/apiKey.routes.js';
import stateRoutes from './routes/state.routes.js';
import districtRoutes from './routes/district.routes.js';
import subDistrictRoutes from './routes/subDistrict.routes.js';
import villageRoutes from './routes/village.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import usageRoutes from './routes/usage.routes.js';
import redis from './config/redis.js';
import systemRoutes from './routes/system.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { createAuthLimiter } from './middlewares/authLimiter.middleware.js';
import { authenticateApiKey } from './middlewares/apiKey.middleware.js';
import { apiLogMiddleware } from './middlewares/apiLog.middleware.js';
import prisma from './config/prisma.js';
import { specs, swaggerUi } from './config/swagger.js';
import { rateLimiter } from './middlewares/rateLimiter.middleware.js';
import helmet from 'helmet';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import billingRoutes from './routes/billing.routes.js';
import { handleWebhook } from './controllers/billing.controller.js';

const app = express();

if (process.env.TRUST_PROXY) {
  // e.g. TRUST_PROXY=1 when deployed behind a single reverse proxy; needed for correct req.ip
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

const DEFAULT_ORIGINS = ['https://censusgrid.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Stripe webhook raw parser (MUST be registered before express.json)
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global Rate Limiter & Logging
app.use(rateLimiter);
app.use(apiLogMiddleware);

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
const authLimiter = createAuthLimiter({ max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20 });
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/keys', apiKeyRoutes);

app.use('/api/v1/states', authenticateApiKey, stateRoutes);

app.use('/api/v1/districts', authenticateApiKey, districtRoutes);

app.use('/api/v1/subdistricts', authenticateApiKey, subDistrictRoutes);

app.use('/api/v1/villages', authenticateApiKey, villageRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/usage', usageRoutes);

app.use('/api/system', systemRoutes);

app.use('/api/users', userRoutes);

app.use('/api/billing', billingRoutes);

// API key verification route
app.get('/api/test-key', authenticateApiKey, (req, res) => {
  res.status(200).json({
    success: true,
    message: "API key valid"
  });
});

// Health Check Endpoint
app.get('/health', async (req, res) => {
  let databaseStatus = 'connected';
  let redisStatus = 'connected';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    databaseStatus = 'disconnected';
  }

  try {
    await redis.get('health-check-ping');
  } catch (err) {
    redisStatus = 'disconnected';
  }

  const isHealthy = databaseStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: databaseStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 + global error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
