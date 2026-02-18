/**
 * Custom middleware for centralized error handling
 * This should be the last middleware in the application
 */
function handleErrors(err, req, res, next) {
  // Error logging for debugging
  console.error('=== ERROR CAUGHT ===');
  console.error('Route:', req.method, req.path);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('====================');

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Error message
  let message = err.message || 'Internal server error';

  // Custom error response based on type
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error: ' + err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 403;
    message = 'Invalid JWT token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Expired JWT token';
  } else if (err.code === 'ENOENT') {
    statusCode = 500;
    message = 'Error accessing data file';
  }

  // Send error response
  res.status(statusCode).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
}

/**
 * Middleware to handle routes not found (404)
 */
function handleNotFound(req, res, next) {
  res.status(404).json({
    error: true,
    message: `Route not found: ${req.method} ${req.path}`,
    path: req.path,
    method: req.method
  });
}

module.exports = {
  handleErrors,
  handleNotFound
};
