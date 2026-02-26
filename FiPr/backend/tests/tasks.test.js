/**
 * ============================================================
 * PRUEBAS AUTOMATIZADAS - TAREAS (tasks.test.js)
 * ============================================================
 * Cubre:
 *  1. Crear tarea exitosamente
 *  2. Crear tarea con datos inválidos (validación fallida)
 *  3. Listar tareas con paginación
 *  4. Listar tareas con filtros (status, priority)
 *  5. Obtener tarea por ID
 *  6. Actualizar tarea exitosamente
 *  7. Cambiar estado de tarea (PATCH /status)
 *  8. Eliminar tarea
 *  9. Usuario no puede ver tarea ajena
 * 10. Admin puede ver todas las tareas
 */

const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers');
const User = require('../models/User');

let userToken;
let adminToken;
let taskId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// Crear usuarios y tokens antes de cada describe
beforeEach(async () => {
  await clearDatabase();

  // Crear usuario normal
  await request(app).post('/api/auth/register').send({
    name: 'Regular User',
    email: 'user@tasks.com',
    password: 'password123',
  });
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@tasks.com',
    password: 'password123',
  });
  userToken = userLogin.body.token;

  // Crear admin directamente
  await User.create({
    name: 'Admin User',
    email: 'admin@tasks.com',
    password: 'admin1234',
    role: 'admin',
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@tasks.com',
    password: 'admin1234',
  });
  adminToken = adminLogin.body.token;
});

const createTaskPayload = (overrides = {}) => ({
  title: 'Tarea de prueba',
  description: 'Descripción de prueba',
  priority: 'high',
  status: 'pending',
  category: 'Testing',
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TAREAS - CRUD', () => {
  test('1. Crear tarea exitosamente devuelve 201 con datos de la tarea', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload());

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Tarea de prueba');
    expect(res.body.data.owner).toBeDefined();
    expect(res.body.data._id).toBeDefined();
    taskId = res.body.data._id;
  });

  test('2. Crear tarea con título vacío devuelve 422 (validación fallida)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '', description: 'sin título' });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('3. Listar tareas devuelve paginación correcta', async () => {
    // Crear 3 tareas
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createTaskPayload({ title: `Tarea ${i}` }));
    }

    const res = await request(app)
      .get('/api/tasks?page=1&limit=2')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2); // Limit = 2
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  test('4. Filtrar tareas por status devuelve solo las correctas', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload({ title: 'Completada', status: 'completed' }));

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload({ title: 'Pendiente', status: 'pending' }));

    const res = await request(app)
      .get('/api/tasks?status=completed')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('completed');
  });

  test('5. Obtener tarea por ID devuelve datos completos', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload());

    const id = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
    expect(res.body.data.title).toBe('Tarea de prueba');
  });

  test('6. Actualizar tarea (PUT) cambia los campos correctamente', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload());

    const id = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload({ title: 'Tarea actualizada', priority: 'low' }));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Tarea actualizada');
    expect(res.body.data.priority).toBe('low');
  });

  test('7. Cambiar estado via PATCH /status actualiza solo el status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload({ status: 'pending' }));

    const id = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/tasks/${id}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.title).toBe('Tarea de prueba'); // Otros campos intactos
  });

  test('8. Eliminar tarea devuelve 200 y ya no existe', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload());

    const id = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verificar que ya no existe
    const getRes = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.statusCode).toBe(404);
  });
});

describe('TAREAS - Control de acceso por rol', () => {
  test('9. Usuario no puede ver/editar tarea de otro usuario (403)', async () => {
    // Crear segunda cuenta de usuario
    await request(app).post('/api/auth/register').send({
      name: 'Otro User',
      email: 'otro@tasks.com',
      password: 'pass5678',
    });
    const otroLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'otro@tasks.com', password: 'pass5678' });
    const otroToken = otroLogin.body.token;

    // Crear tarea con el primer usuario
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload());

    const id = createRes.body.data._id;

    // Segundo usuario intenta ver la tarea
    const res = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${otroToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('10. Admin puede ver tareas de todos los usuarios', async () => {
    // Crear tarea con usuario normal
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createTaskPayload({ title: 'Tarea del usuario' }));

    // Admin lista tareas (debe ver todas)
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
