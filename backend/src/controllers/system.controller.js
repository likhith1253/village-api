/**
 * Controller to handle fetching system info.
 */
export const getSystemInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  });
};
