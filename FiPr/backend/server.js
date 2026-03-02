require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Global Middlewares ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Car Inventory API running.', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/auth/users              (admin)`);
    console.log(`   GET    /api/cars                   (pagination + filters)`);
    console.log(`   GET    /api/cars/stats             (admin)`);
    console.log(`   GET    /api/cars/:id`);
    console.log(`   POST   /api/cars`);
    console.log(`   PUT    /api/cars/:id`);
    console.log(`   DELETE /api/cars/:id`);
    console.log(`   PATCH  /api/cars/:id/status\n`);
  });
  return server;
};

// Only start if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
