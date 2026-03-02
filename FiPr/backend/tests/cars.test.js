/**
 * ============================================================
 * AUTOMATED TESTS - CAR INVENTORY (cars.test.js)
 * ============================================================
 * Covers:
 *  1. Create a car listing successfully
 *  2. Create car with invalid data (validation failure)
 *  3. List cars with pagination
 *  4. List cars with filters (status, make, price range)
 *  5. Get car by ID
 *  6. Update car successfully
 *  7. Update car status (PATCH /status)
 *  8. Delete a car listing
 *  9. Regular user cannot view another user's car
 * 10. Admin can view all car listings
 */

const request = require('supertest');
const app = require('../server');
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./helpers');
const User = require('../models/User');

let userToken;
let adminToken;
let carId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearDatabase();

  // Create a regular user
  await request(app).post('/api/auth/register').send({
    name: 'Regular User',
    email: 'user@cars.com',
    password: 'password123',
  });
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@cars.com',
    password: 'password123',
  });
  userToken = userLogin.body.token;

  // Create admin user directly
  await User.create({
    name: 'Admin User',
    email: 'admin@cars.com',
    password: 'admin1234',
    role: 'admin',
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@cars.com',
    password: 'admin1234',
  });
  adminToken = adminLogin.body.token;
});

const createCarPayload = (overrides = {}) => ({
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  color: 'Silver',
  price: 25000,
  mileage: 15000,
  status: 'available',
  condition: 'used',
  fuelType: 'gasoline',
  transmission: 'automatic',
  description: 'Well-maintained sedan in excellent condition.',
  ...overrides,
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('CARS - CRUD', () => {
  test('1. Create car listing returns 201 with car data', async () => {
    const res = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload());

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Toyota');
    expect(res.body.data.model).toBe('Camry');
    expect(res.body.data.addedBy).toBeDefined();
    expect(res.body.data._id).toBeDefined();
    carId = res.body.data._id;
  });

  test('2. Create car with missing required fields returns 422 (validation failure)', async () => {
    const res = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: '', model: '', year: 1800, price: -100, mileage: -1 });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('3. List cars returns correct pagination', async () => {
    // Create 3 cars
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createCarPayload({ model: `Model ${i}`, price: 20000 + i * 1000 }));
    }

    const res = await request(app)
      .get('/api/cars?page=1&limit=2')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });

  test('4. List cars with filters (status and make)', async () => {
    await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload({ status: 'available', make: 'Toyota' }));

    await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload({ status: 'sold', make: 'Honda', model: 'Civic' }));

    const res = await request(app)
      .get('/api/cars?status=available&make=toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((c) => c.status === 'available')).toBe(true);
  });

  test('5. Get car by ID returns correct car', async () => {
    const created = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload());

    carId = created.body.data._id;

    const res = await request(app)
      .get(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(carId);
    expect(res.body.data.make).toBe('Toyota');
  });

  test('6. Update car listing returns updated data', async () => {
    const created = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload());

    carId = created.body.data._id;

    const res = await request(app)
      .put(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload({ price: 30000, color: 'Blue' }));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(30000);
    expect(res.body.data.color).toBe('Blue');
  });

  test('7. Update car status via PATCH returns updated status', async () => {
    const created = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload({ status: 'available' }));

    carId = created.body.data._id;

    const res = await request(app)
      .patch(`/api/cars/${carId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'sold' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('sold');
  });

  test('8. Delete car listing returns success message', async () => {
    const created = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload());

    carId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/cars/${carId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(getRes.statusCode).toBe(404);
  });
});

describe('CARS - Authorization', () => {
  test('9. Regular user cannot view another user\'s car listing', async () => {
    // Admin adds a car
    const adminCar = await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createCarPayload({ make: 'BMW', model: 'X5' }));

    const adminCarId = adminCar.body.data._id;

    // Regular user tries to access admin's car
    const res = await request(app)
      .get(`/api/cars/${adminCarId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('10. Admin can view all car listings regardless of owner', async () => {
    // Regular user creates a car
    await request(app)
      .post('/api/cars')
      .set('Authorization', `Bearer ${userToken}`)
      .send(createCarPayload({ make: 'Ford', model: 'Mustang' }));

    // Admin lists all cars
    const res = await request(app)
      .get('/api/cars')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
