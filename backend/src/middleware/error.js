const { StatusCodes, getReasonPhrase } = require('http-status-codes');

// 404 for unmatched routes
const notFound = (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Not Found',
    path: req.originalUrl,
  });
};

// Centralized error handler
// Ensure we never leak stack traces in production
// and always return consistent JSON.
/* eslint no-unused-vars: 0 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR);
  const payload = {
    error: message,
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
