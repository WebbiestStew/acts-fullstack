const jwt = require('jsonwebtoken');

// Secret key for JWT (in production should be in environment variables)
const JWT_SECRET = 'clave_secreta_super_segura_2024';

/**
 * Middleware to authenticate JWT tokens
 * Verifies that the token in the Authorization header is valid
 */
function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const token = req.headers['authorization'];
  
  // Check if token is missing
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'No authentication token provided' 
    });
  }

  try {
    // Verify and decode the token
    // Token can come as "Bearer TOKEN", so we extract only the token
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    
    // Add user data to request object
    req.user = decoded;
    
    // Continue to next middleware function or route
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is not valid or has expired' 
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
