const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { handleErrors, handleNotFound } = require('./middleware/errores');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tareas');

// Create Express application
const app = express();
const PORT = 3000;

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON in request body
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for request logging (useful for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Tasks API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /register',
        login: 'POST /login'
      },
      tasks: {
        'get all': 'GET /tareas (requires token)',
        'get one': 'GET /tareas/:id (requires token)',
        'create': 'POST /tareas (requires token)',
        'update': 'PUT /tareas/:id (requires token)',
        'delete': 'DELETE /tareas/:id (requires token)'
      }
    },
    instructions: 'Include token in Authorization header as: Bearer <token>'
  });
});

// Authentication routes (no additional prefix)
app.use('/', authRoutes);

// Task routes (no additional prefix, already in router)
app.use('/', tasksRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Middleware for routes not found (404)
// Must go after all routes
app.use(handleNotFound);

// Centralized error handling middleware
// Must be the last middleware
app.use(handleErrors);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log('  POST /register - Register new user');
  console.log('  POST /login - User login');
  console.log('  GET /tareas - Get all tasks (authenticated)');
  console.log('  POST /tareas - Create new task (authenticated)');
  console.log('  PUT /tareas/:id - Update task (authenticated)');
  console.log('  DELETE /tareas/:id - Delete task (authenticated)');
  console.log('='.repeat(50));
  console.log('💡 For debugging, run: node --inspect server.js');
  console.log('='.repeat(50));
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

module.exports = app;
