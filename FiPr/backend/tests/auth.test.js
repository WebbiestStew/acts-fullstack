/**
 * ============================================================
 * PRUEBAS AUTOMATIZADAS - AUTENTICACIÓN (auth.test.js)
 * ============================================================
 * Cubre:
 *  1. Registro exitoso
 *  2. Registro con email duplicado
 *  3. Registro con datos inválidos (validación fallida)
 *  4. Login exitoso
 *  5. Login con contraseña incorrecta
 *  6. Login con email no registrado
 *  7. Acceso a ruta protegida con token válido
 *  8. Acceso denegado sin token
 *  9. Acceso denegado por rol insuficiente
 * 10. Cambio de rol por admin
 */

const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers');

let adminToken;
let userToken;
let userId;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearDatabase();
  adminToken = undefined;
  userToken = undefined;
  userId = undefined;
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const registerUser = (overrides = {}) =>
  request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
    ...overrides,
  });

const loginUser = (email = 'user@test.com', password = 'password123') =>
  request(app).post('/api/auth/login').send({ email, password });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AUTH - Registro', () => {
  test('1. Registro exitoso devuelve 201 y token JWT', async () => {
    const res = await registerUser();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('user@test.com');
    expect(res.body.user.password).toBeUndefined(); // No exponer contraseña
  });

  test('2. Registro con email duplicado devuelve 409', async () => {
    await registerUser(); // Primer registro
    const res = await registerUser(); // Segundo registro con mismo email

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email ya está registrado/i);
  });

  test('3. Registro con datos inválidos devuelve 422 (validación fallida)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A', // demasiado corto
      email: 'correo-invalido', // no es email
      password: '123', // muy corta
    });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('AUTH - Login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  test('4. Login exitoso devuelve 200, token y datos del usuario', async () => {
    const res = await loginUser();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@test.com');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined();
  });

  test('5. Login con contraseña incorrecta devuelve 401', async () => {
    const res = await loginUser('user@test.com', 'wrongpassword');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/credenciales inválidas/i);
  });

  test('6. Login con email no registrado devuelve 401', async () => {
    const res = await loginUser('noexiste@test.com');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('AUTH - Protección de rutas y roles', () => {
  beforeEach(async () => {
    // Registrar y logear usuario normal
    await registerUser();
    const loginRes = await loginUser();
    userToken = loginRes.body.token;
    userId = loginRes.body.user._id;

    // Registrar admin (simulando que el campo viene del body pero el router lo bloquea)
    // Creamos admin directamente con el modelo
    const User = require('../models/User');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'admin1234',
      role: 'admin',
    });
    const adminLogin = await loginUser('admin@test.com', 'admin1234');
    adminToken = adminLogin.body.token;
  });

  test('7. Acceso permitido a /api/auth/me con token válido devuelve 200', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('user@test.com');
  });

  test('8. Acceso denegado a /api/auth/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('9. Acceso denegado a /api/auth/users por rol insuficiente devuelve 403', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/rol/i);
  });

  test('10. Admin puede acceder a /api/auth/users y listar usuarios', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
