import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Car from '../models/Car.js';

describe('Car Routes', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/act4_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Car.deleteMany({});

    // Create a test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'caruser',
        email: 'car@example.com',
        password: 'password123'
      })
      .expect(201);

    token = response.body.data.token;
    userId = response.body.data.id;
  });

  describe('POST /api/cars', () => {
    it('should create a new car with valid data', async () => {
      const carData = {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 28500,
        mileage: 15000,
        color: 'Silver',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        condition: 'Used'
      };

      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(carData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brand).toBe(carData.brand);
      expect(response.body.data.model).toBe(carData.model);
      expect(response.body.data.price).toBe(carData.price);
      expect(response.body.data.createdBy).toBeDefined();
    });

    it('should not create car without authentication', async () => {
      const carData = {
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 24000,
        mileage: 20000,
        color: 'Blue',
        transmission: 'Manual',
        fuelType: 'Gasoline',
        condition: 'Used'
      };

      const response = await request(app)
        .post('/api/cars')
        .send(carData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create car with missing required fields', async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Ford'
          // Missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create car with negative price', async () => {
      const carData = {
        brand: 'Chevrolet',
        model: 'Malibu',
        year: 2021,
        price: -10000,
        mileage: 30000,
        color: 'Red',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        condition: 'Used'
      };

      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send(carData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cars', () => {
    beforeEach(async () => {
      // Create test cars
      await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Tesla',
          model: 'Model 3',
          year: 2024,
          price: 42000,
          mileage: 5000,
          color: 'White',
          transmission: 'Automatic',
          fuelType: 'Electric',
          condition: 'New'
        });

      await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'BMW',
          model: 'X5',
          year: 2023,
          price: 65000,
          mileage: 12000,
          color: 'Black',
          transmission: 'Automatic',
          fuelType: 'Hybrid',
          condition: 'Certified Pre-Owned'
        });
    });

    it('should get all cars', async () => {
      const response = await request(app)
        .get('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
    });

    it('should not get cars without authentication', async () => {
      const response = await request(app)
        .get('/api/cars')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cars/:id', () => {
    let carId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Audi',
          model: 'A4',
          year: 2023,
          price: 45000,
          mileage: 8000,
          color: 'Gray',
          transmission: 'Automatic',
          fuelType: 'Gasoline',
          condition: 'Used'
        });

      carId = response.body.data._id;
    });

    it('should get a single car by ID', async () => {
      const response = await request(app)
        .get(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(carId);
      expect(response.body.data.brand).toBe('Audi');
    });

    it('should return 404 for non-existent car', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Car not found');
    });
  });

  describe('PUT /api/cars/:id', () => {
    let carId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Mercedes-Benz',
          model: 'C-Class',
          year: 2022,
          price: 52000,
          mileage: 15000,
          color: 'Silver',
          transmission: 'Automatic',
          fuelType: 'Diesel',
          condition: 'Used'
        });

      carId = response.body.data._id;
    });

    it('should update a car successfully', async () => {
      const updatedData = {
        price: 48000,
        mileage: 16000
      };

      const response = await request(app)
        .put(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(48000);
      expect(response.body.data.mileage).toBe(16000);
    });

    it('should not update car without authentication', async () => {
      const response = await request(app)
        .put(`/api/cars/${carId}`)
        .send({ price: 50000 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent car update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 50000 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/cars/:id', () => {
    let carId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Volkswagen',
          model: 'Jetta',
          year: 2021,
          price: 22000,
          mileage: 25000,
          color: 'Blue',
          transmission: 'Manual',
          fuelType: 'Gasoline',
          condition: 'Used'
        });

      carId = response.body.data._id;
    });

    it('should delete a car successfully', async () => {
      const response = await request(app)
        .delete(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify car is deleted
      const getResponse = await request(app)
        .get(`/api/cars/${carId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should not delete car without authentication', async () => {
      const response = await request(app)
        .delete(`/api/cars/${carId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent car deletion', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/cars/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Tests', () => {
    let car1Id;
    let user2Token;

    beforeEach(async () => {
      // Create car by user 1
      const carResponse = await request(app)
        .post('/api/cars')
        .set('Authorization', `Bearer ${token}`)
        .send({
          brand: 'Mazda',
          model: 'CX-5',
          year: 2023,
          price: 32000,
          mileage: 10000,
          color: 'Red',
          transmission: 'Automatic',
          fuelType: 'Gasoline',
          condition: 'Used'
        });

      car1Id = carResponse.body.data._id;

      // Create second user
      const user2Response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123'
        });

      user2Token = user2Response.body.data.token;
    });

    it('should not allow user to update another user\'s car', async () => {
      const response = await request(app)
        .put(`/api/cars/${car1Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ price: 30000 })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should not allow user to delete another user\'s car', async () => {
      const response = await request(app)
        .delete(`/api/cars/${car1Id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });
  });
});
