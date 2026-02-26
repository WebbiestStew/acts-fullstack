/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Mongoose: duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `El campo '${field}' ya existe con ese valor.`;
    statusCode = 409;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 422;
  }

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `ID inválido: ${err.value}`;
    statusCode = 400;
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    message = 'Token inválido.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expirado.';
    statusCode = 401;
  }

  const response = { success: false, message };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
