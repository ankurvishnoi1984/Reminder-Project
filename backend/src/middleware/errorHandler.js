const LoggerService = require('../services/loggerService');

/**
 * Global error handling middleware
 * Captures all errors and logs them to the database
 */
const errorHandler = async (err, req, res, next) => {
  // Log the error
  const logEntry = await LoggerService.logError(err, req, {
    statusCode: err.status || err.statusCode || 500
  });

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        logId: logEntry?.id
      })
    }
  };

  // Log the error
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
