/**
 * seed.js – Popula la base de datos con datos de ejemplo
 * Ejecutar: node seed.js (desde la carpeta backend)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // Limpiar colecciones
  await User.deleteMany({});
  await Task.deleteMany({});
  console.log('Colecciones limpiadas');

  // Crear usuarios
  const adminUser = await User.create({
    name: 'Admin Principal',
    email: 'admin@taskmanager.com',
    password: 'admin1234',
    role: 'admin',
  });

  const regularUser = await User.create({
    name: 'Usuario Demo',
    email: 'user@taskmanager.com',
    password: 'user1234',
    role: 'user',
  });

  console.log('Usuarios creados:', adminUser.email, regularUser.email);

  // Crear tareas para el usuario regular
  const tasks = await Task.insertMany([
    {
      title: 'Configurar servidor Express',
      description: 'Instalar Express.js y configurar middlewares básicos',
      priority: 'high',
      status: 'completed',
      category: 'Backend',
      owner: regularUser._id,
    },
    {
      title: 'Diseñar interfaz de usuario',
      description: 'Crear wireframes y mockups para el dashboard',
      priority: 'medium',
      status: 'in-progress',
      category: 'Frontend',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semana
      owner: regularUser._id,
    },
    {
      title: 'Escribir pruebas Jest',
      description: 'Implementar suite de pruebas para autenticación y CRUD',
      priority: 'high',
      status: 'pending',
      category: 'Testing',
      owner: regularUser._id,
    },
    {
      title: 'Documentar API REST',
      description: 'Crear documentación técnica de todos los endpoints',
      priority: 'low',
      status: 'pending',
      category: 'Docs',
      owner: adminUser._id,
    },
    {
      title: 'Configurar MongoDB Atlas',
      description: 'Crear cluster gratuito y obtener URI de conexión',
      priority: 'high',
      status: 'completed',
      category: 'DevOps',
      owner: adminUser._id,
    },
    {
      title: 'Deploy en Render',
      description: 'Desplegar backend y frontend en Render.com',
      priority: 'medium',
      status: 'pending',
      category: 'DevOps',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 semanas
      owner: adminUser._id,
    },
  ]);

  console.log(`${tasks.length} tareas creadas`);
  console.log('\nDatos de acceso de prueba:');
  console.log('  Admin:  admin@taskmanager.com / admin1234');
  console.log('  User:   user@taskmanager.com  / user1234');

  await mongoose.disconnect();
  console.log('\nSeed finalizado exitosamente.');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
