/**
 * Reusable helper for sending successful API responses.
 * @param {object} res - Express response object
 * @param {string} message - Response message
 * @param {any} data - Payload to send in the response
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Express JSON response
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
