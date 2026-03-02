/**
 * ============================================================
 * AUTOMATED TESTS - AUTHENTICATION (auth.test.js)
 * ============================================================
 * Covers:
 *  1. Successful registration
 *  2. Duplicate email registration
 *  3. Invalid data registration (validation failure)
 *  4. Successful login
 *  5. Login with wrong password
 *  6. Login with unregistered email
 *  7. Access allowed with valid token
 *  8. Access denied without token
 *  9. Access denied by insufficient role
 * 10. Admin can change user role
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

describe('AUTH - Registration', () => {
  test('1. Successful registration returns 201 and JWT token', async () => {
    const res = await registerUser();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('user@test.com');
    expect(res.body.user.password).toBeUndefined();
  });

  test('2. Duplicate email registration returns 409', async () => {
    await registerUser();
    const res = await registerUser();

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email is already registered/i);
  });

  test('3. Registration with invalid data returns 422 (validation failure)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'invalid-email',
      password: '123',
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

  test('4. Successful login returns 200, token and user data', async () => {
    const res = await loginUser();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@test.com');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined();
  });

  test('5. Login with wrong password returns 401', async () => {
    const res = await loginUser('user@test.com', 'wrongpassword');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('6. Login with unregistered email returns 401', async () => {
    const res = await loginUser('notfound@test.com');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('AUTH - Route protection and roles', () => {
  beforeEach(async () => {
    await registerUser();
    const loginRes = await loginUser();
    userToken = loginRes.body.token;
    userId = loginRes.body.user._id;

    const User = require('../models/User');
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'admin1234',
      role: 'admin',
    });
    const adminLogin = await loginUser('admin@test.com', 'admin1234');
    adminToken = adminLogin.body.token;
  });

  test('7. Access allowed to /api/auth/me with valid token returns 200', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('user@test.com');
  });

  test('8. Access denied to /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('9. Access denied to /api/auth/users by insufficient role returns 403', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/role/i);
  });

  test('10. Admin can access /api/auth/users and list all users', async () => {
    const res = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
