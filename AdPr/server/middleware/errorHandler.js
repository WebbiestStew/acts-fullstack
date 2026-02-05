function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: message });
}

function asyncHandler(fn) {
  return function asyncWrapper(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { notFound, errorHandler, asyncHandler };
