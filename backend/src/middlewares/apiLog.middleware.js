import prisma from '../config/prisma.js';

/**
 * Middleware to log details of successful API-key authenticated requests.
 * Runs on response 'finish' event to capture final status code.
 */
export const apiLogMiddleware = (req, res, next) => {
  res.on('finish', async () => {
    try {
      // Only log requests that are successfully authenticated using an API key
      if (req.apiUser && req.apiKey) {
        await prisma.apiLog.create({
          data: {
            userId: req.apiUser.id,
            apiKeyId: req.apiKey.id,
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode
          }
        });
      }
    } catch (error) {
      console.error('Error creating ApiLog record:', error);
    }
  });

  next();
};
