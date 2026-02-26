require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middlewares globales ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API funcionando correctamente.', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Error handler global (debe ser el último middleware)
app.use(errorHandler);

// ─── Inicio del servidor ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋 Endpoints disponibles:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/auth/users       (admin)`);
    console.log(`   GET    /api/tasks            (paginación + filtros)`);
    console.log(`   GET    /api/tasks/:id`);
    console.log(`   POST   /api/tasks`);
    console.log(`   PUT    /api/tasks/:id`);
    console.log(`   DELETE /api/tasks/:id`);
    console.log(`   PATCH  /api/tasks/:id/status`);
    console.log(`   GET    /api/tasks/stats      (admin)\n`);
  });
  return server;
};

// Solo iniciar si no estamos en modo de prueba
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
