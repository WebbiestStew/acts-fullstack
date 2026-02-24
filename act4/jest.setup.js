import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Set test environment variables (these will override .env if needed)
process.env.NODE_ENV = 'test';

// Use the same JWT_SECRET from .env for consistency
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
}

if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = '7d';
}
