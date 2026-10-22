/**
 * Global Express error handling middleware.
 * Client errors (4xx) keep their message; anything else is logged
 * server-side and returned as a generic message so stack traces,
 * SQL fragments and Prisma internals never reach the client.
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err.statusCode || err.status) ? (err.statusCode || err.status) : 500;

  if (statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.path}:`, err);
    return res.status(statusCode).json({ success: false, message: 'Internal Server Error' });
  }

  return res.status(statusCode).json({ success: false, message: err.message || 'Bad Request' });
};

export const notFoundHandler = (req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' });
