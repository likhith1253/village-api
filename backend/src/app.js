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
import { errorHandler } from './middlewares/errorHandler.js';
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

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://censusgrid.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Debug Routes
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/runtime', (req, res) => {
    res.json({
      port: process.env.PORT || 3000,
      pid: process.pid,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/debug/users', async (req, res, next) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/debug/log-test', authenticateApiKey, apiLogMiddleware, (req, res) => {
    res.json({
      success: true,
      message: "Log test successful"
    });
  });
}

// Routes
console.log('Mounting route: /api/auth');
app.use('/api/auth', authRoutes);

console.log('Mounting route: /api/keys');
app.use('/api/keys', apiKeyRoutes);

console.log('Mounting route: /api/v1/states');
app.use('/api/v1/states', authenticateApiKey, stateRoutes);

console.log('Mounting route: /api/v1/districts');
app.use('/api/v1/districts', authenticateApiKey, districtRoutes);

console.log('Mounting route: /api/v1/subdistricts');
app.use('/api/v1/subdistricts', authenticateApiKey, subDistrictRoutes);

console.log('Mounting route: /api/v1/villages');
app.use('/api/v1/villages', authenticateApiKey, villageRoutes);

console.log('Mounting route: /api/analytics');
app.use('/api/analytics', analyticsRoutes);

console.log('Mounting route: /api/usage');
app.use('/api/usage', usageRoutes);

console.log('Mounting route: /api/system');
app.use('/api/system', systemRoutes);

console.log('Mounting route: /api/users');
app.use('/api/users', userRoutes);

console.log('Mounting route: /api/billing');
app.use('/api/billing', billingRoutes);

// Temporary Test API Key Route
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

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
