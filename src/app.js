import express from 'express';
import authRoutes from './routes/auth.routes.js';
import apiKeyRoutes from './routes/apiKey.routes.js';
import stateRoutes from './routes/state.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticateApiKey } from './middlewares/apiKey.middleware.js';
import { apiLogMiddleware } from './middlewares/apiLog.middleware.js';
import prisma from './config/prisma.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Routes
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

// Routes
console.log('Mounting route: /api/auth');
app.use('/api/auth', authRoutes);

console.log('Mounting route: /api/keys');
app.use('/api/keys', apiKeyRoutes);

console.log('Mounting route: /api/v1/states');
app.use('/api/v1/states', stateRoutes);

// Temporary Test API Key Route
app.get('/api/test-key', authenticateApiKey, (req, res) => {
  res.status(200).json({
    success: true,
    message: "API key valid"
  });
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Village API is running"
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
