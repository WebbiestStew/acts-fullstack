# AdPr - RESTful API with Express.js

A complete RESTful API backend built with Express.js, PostgreSQL, and JWT authentication.

## Features

✅ **Express.js Server** - Basic server configuration with CORS support  
✅ **PostgreSQL Database** - Configured with connection pooling  
✅ **JWT Authentication** - Secure user registration and login  
✅ **CRUD Operations** - Complete Create, Read, Update, Delete functionality  
✅ **Protected Routes** - Authorization middleware for secure operations  
✅ **Custom Error Handling** - Centralized error management middleware  
✅ **Async Error Wrapper** - Automatic error handling for async routes  
✅ **Environment Variables** - Secure configuration management  

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js 5.2** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration

## Project Structure

```
AdPr/
├── server/
│   ├── server.js           # Main application entry point
│   ├── config.js           # Environment validation and configuration
│   ├── db.js              # PostgreSQL connection pool
│   ├── schema.sql         # Database schema definition
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication middleware
│   │   └── errorHandler.js # Error handling middleware
│   └── routes/
│       ├── auth.js        # Authentication routes (register, login)
│       └── items.js       # CRUD routes for items
├── package.json
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_NAME=adpr_db
```

### 3. Setup PostgreSQL Database

Create the database:

```bash
psql -U postgres
CREATE DATABASE adpr_db;
\c adpr_db
```

Run the schema:

```bash
psql -U postgres -d adpr_db -f server/schema.sql
```

Or copy the SQL from `schema.sql` and run it manually.

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Items Endpoints

#### Get All Items (Public)
```http
GET /api/items
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample Item",
      "description": "Description here",
      "owner_id": 1,
      "created_at": "2026-02-06T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Item (Public)
```http
GET /api/items/:id
```

**Response:**
```json
{
  "item": {
    "id": 1,
    "title": "Sample Item",
    "description": "Description here",
    "owner_id": 1,
    "created_at": "2026-02-06T10:00:00.000Z"
  }
}
```

#### Create Item (Protected)
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Item",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "item": {
    "id": 2,
    "title": "New Item",
    "description": "Optional description",
    "owner_id": 1,
    "created_at": "2026-02-06T10:30:00.000Z"
  }
}
```

#### Update Item (Protected)
```http
PUT /api/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "item": {
    "id": 2,
    "title": "Updated Title",
    "description": "Updated description",
    "owner_id": 1,
    "created_at": "2026-02-06T10:30:00.000Z"
  }
}
```

#### Delete Item (Protected)
```http
DELETE /api/items/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Security Features

### JWT Authentication
- Tokens expire after 2 hours
- Secure token validation on protected routes
- Bearer token format required

### Password Security
- Passwords hashed using bcrypt (10 rounds)
- Plain text passwords never stored

### Route Protection
- **Public routes:** GET /api/items, GET /api/items/:id
- **Protected routes:** POST, PUT, DELETE on /api/items
- Users can only modify/delete their own items

## Middleware

### Error Handler (`errorHandler.js`)

Three middleware functions:

1. **`asyncHandler(fn)`** - Wraps async route handlers to catch errors automatically
2. **`notFound(req, res, next)`** - Handles 404 errors for undefined routes
3. **`errorHandler(err, req, res, next)`** - Centralized error handling with proper status codes

Features:
- Automatic error logging for 500+ status codes
- Consistent error response format
- Status code preservation from thrown errors

### Authentication Middleware (`auth.js`)

**`requireAuth(req, res, next)`** - Validates JWT tokens

Features:
- Extracts Bearer token from Authorization header
- Verifies token signature and expiration
- Attaches user data to `req.user`
- Returns 401 for missing or invalid tokens

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Items Table
```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Environment Variables

All required variables are validated on startup in `config.js`:

- `JWT_SECRET` - Secret key for JWT signing
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Server port (optional, defaults to 3000)

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Create an item (replace TOKEN):
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My Item","description":"This is a test item"}'
```

### Get all items:
```bash
curl http://localhost:3000/api/items
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not allowed to access resource)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email registration)
- `500` - Internal Server Error

## Authors

Diego y Arturo

## License

UNLICENSED
