# Technical Documentation - Task Manager Application

**Authors:** Diego y Arturo  
**Date:** February 6, 2026  
**Version:** 1.0.0

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints Documentation](#api-endpoints-documentation)
7. [Authentication System](#authentication-system)
8. [Frontend Implementation](#frontend-implementation)
9. [Setup Instructions](#setup-instructions)
10. [Testing](#testing)

---

## 1. Project Overview

Full-stack web application for task management with user authentication. Users can register, login, and manage their personal tasks (create, read, update, delete).

### Key Features
- User registration and authentication
- JWT-based session management
- Personal task management (CRUD operations)
- Responsive UI design
- Secure password storage with bcrypt
- Protected API endpoints

---

## 2. Architecture

### System Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄────► │  Express.js  │ ◄────► │ PostgreSQL  │
│  (Frontend) │  HTTP   │  (Backend)   │   SQL   │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Architecture Pattern
- **Frontend:** Single Page Application (SPA) with vanilla JavaScript
- **Backend:** RESTful API with Express.js
- **Database:** PostgreSQL with relational schema
- **Authentication:** JWT tokens stored in localStorage

---

## 3. Technology Stack

### Backend
- **Node.js** v23.10.0 - Runtime environment
- **Express.js** v5.2.1 - Web framework
- **PostgreSQL** - Relational database
- **pg** v8.18.0 - PostgreSQL client
- **jsonwebtoken** v9.0.3 - JWT implementation
- **bcryptjs** v3.0.3 - Password hashing
- **dotenv** v17.2.3 - Environment variables
- **cors** v2.8.6 - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **JavaScript ES6+** - Logic and API communication
- **Font Awesome** - Icons
- **Google Fonts** (Poppins) - Typography

---

## 4. Project Structure

```
AdPr/
├── server/
│   ├── server.js              # Main application entry point
│   ├── config.js              # Environment configuration
│   ├── db.js                 # Database connection pool
│   ├── schema.sql            # Database schema
│   ├── setup.js              # Database initialization script
│   ├── createDb.js           # Database creation script
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   └── routes/
│       ├── auth.js           # Authentication routes
│       └── items.js          # Task/item CRUD routes
├── login.html                 # Login/Register page
├── index.html                 # Main application page
├── auth.css                   # Login page styles
├── style.css                  # Main page styles
├── auth.js                    # Login page logic
├── app.js                     # Main application logic
├── package.json               # Project dependencies
├── .env                       # Environment variables (not in repo)
├── .env.example              # Environment template
└── README.md                  # Project documentation
```

---

## 5. Database Schema

### Tables

#### Users Table
Stores user authentication information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `email`: Unique user email (login identifier)
- `password_hash`: Bcrypt hashed password (10 rounds)
- `created_at`: Timestamp of account creation

#### Items Table
Stores user tasks/items.

```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `title`: Task title (required)
- `description`: Task description (optional)
- `owner_id`: Foreign key to users table
- `created_at`: Timestamp of task creation

**Relationships:**
- One-to-many: One user can have many items
- Cascade delete: When a user is deleted, all their items are deleted

---

## 6. API Endpoints Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `409`: Email already registered

---

#### 2. Login
Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1770404542,
  "exp": 1770411742
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

---

### Task/Item Endpoints

#### 3. Get All Items (Public)
Retrieve all tasks from all users.

**Endpoint:** `GET /api/items`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the fullstack project",
      "owner_id": 1,
      "created_at": "2026-02-06T19:02:34.110Z"
    },
    {
      "id": 2,
      "title": "Study for exam",
      "description": null,
      "owner_id": 2,
      "created_at": "2026-02-06T19:15:22.340Z"
    }
  ]
}
```

---

#### 4. Get Single Item (Public)
Retrieve a specific task by ID.

**Endpoint:** `GET /api/items/:id`

**URL Parameters:**
- `id` (integer): Item ID

**Success Response (200):**
```json
{
  "item": {
    "id": 1,
    "title": "Complete project",
    "description": "Finish the fullstack project",
    "owner_id": 1,
    "created_at": "2026-02-06T19:02:34.110Z"
  }
}
```

**Error Responses:**
- `404`: Item not found

---

#### 5. Create Item (Protected)
Create a new task. Requires authentication.

**Endpoint:** `POST /api/items`

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Optional description"
}
```

**Success Response (201):**
```json
{
  "item": {
    "id": 3,
    "title": "New Task",
    "description": "Optional description",
    "owner_id": 1,
    "created_at": "2026-02-06T20:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing title
- `401`: Missing or invalid token

---

#### 6. Update Item (Protected)
Update an existing task. User can only update their own items.

**Endpoint:** `PUT /api/items/:id`

**URL Parameters:**
- `id` (integer): Item ID

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "item": {
    "id": 3,
    "title": "Updated Title",
    "description": "Updated description",
    "owner_id": 1,
    "created_at": "2026-02-06T20:30:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not allowed (item belongs to another user)
- `404`: Item not found

---

#### 7. Delete Item (Protected)
Delete a task. User can only delete their own items.

**Endpoint:** `DELETE /api/items/:id`

**URL Parameters:**
- `id` (integer): Item ID

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Success Response (204):**
No content

**Error Responses:**
- `401`: Missing or invalid token
- `403`: Not allowed (item belongs to another user)
- `404`: Item not found

---

#### 8. Health Check
Check if the server is running.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "ok"
}
```

---

## 7. Authentication System

### JWT Token Structure

**Algorithm:** HS256 (HMAC with SHA-256)  
**Expiration:** 2 hours  
**Secret:** Stored in environment variable `JWT_SECRET`

### Authentication Flow

```
1. User Registration:
   ┌─────────┐                ┌─────────┐                ┌──────────┐
   │ Client  │───Register────►│ Backend │───Hash Pass───►│ Database │
   └─────────┘                └─────────┘                └──────────┘

2. User Login:
   ┌─────────┐                ┌─────────┐                ┌──────────┐
   │ Client  │────Login──────►│ Backend │───Verify──────►│ Database │
   └─────────┘◄───JWT Token───└─────────┘                └──────────┘

3. Protected Request:
   ┌─────────┐                ┌─────────┐                ┌──────────┐
   │ Client  │─Request+Token─►│ Backend │─Validate JWT──►│  Action  │
   └─────────┘◄───Response────└─────────┘                └──────────┘
```

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Storage:** Only hashed passwords stored in database
- **Validation:** bcrypt.compare() for login verification

### Middleware Implementation

**requireAuth** - Protects routes requiring authentication

```javascript
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 8. Frontend Implementation

### Pages

#### 1. Login/Register Page (login.html)
**Features:**
- Toggle between login and register forms
- Email and password validation
- Password visibility toggle
- Error message display
- Animated background with floating shapes
- Auto-login after registration

**JavaScript Logic:**
- Form validation before submission
- Fetch API calls to backend
- Token storage in localStorage
- Redirect on successful authentication

#### 2. Main Application Page (index.html)
**Features:**
- User info display with email
- Logout functionality
- Add new tasks
- View all tasks
- Edit existing tasks (modal)
- Delete tasks with confirmation
- Filter tasks (all/pending/completed)
- Task completion checkbox (local only)
- Task statistics (total/completed)
- Empty state message
- Responsive design

**JavaScript Architecture:**
- `Task` class - Data model
- `TaskManager` class - Business logic and API calls
- `TaskInterface` class - UI management and DOM manipulation

### API Communication

All API calls use the Fetch API with async/await:

```javascript
const response = await fetch(`${API_URL}/items`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title, description })
});
```

---

## 9. Setup Instructions

### Prerequisites
- Node.js v23.10.0 or higher
- PostgreSQL installed and running
- Git

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/WebbiestStew/acts-fullstack.git
cd acts-fullstack/AdPr
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=4000
JWT_SECRET=your-super-secret-key-here
DB_HOST=localhost
DB_PORT=5432
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=adpr_db
```

4. **Create database and tables:**
```bash
node server/createDb.js
node server/setup.js
```

5. **Start the server:**
```bash
npm run dev
```

6. **Open the application:**
Open `login.html` in your browser or navigate to:
```
file:///path/to/AdPr/login.html
```

---

## 10. Testing

### Manual Testing with cURL

#### Test User Registration
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Test Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Test Create Item (Protected)
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:4000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Task","description":"Testing CRUD"}'
```

#### Test Get All Items (Public)
```bash
curl http://localhost:4000/api/items
```

#### Test Update Item (Protected)
```bash
curl -X PUT http://localhost:4000/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated Task","description":"Updated description"}'
```

#### Test Delete Item (Protected)
```bash
curl -X DELETE http://localhost:4000/api/items/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Testing Checklist

- [ ] User can register with valid email and password
- [ ] Registration fails with duplicate email
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] JWT token is received and stored
- [ ] Protected routes reject requests without token
- [ ] User can create new tasks
- [ ] User can view all tasks
- [ ] User can edit their own tasks
- [ ] User cannot edit other users' tasks
- [ ] User can delete their own tasks
- [ ] User cannot delete other users' tasks
- [ ] User can logout successfully
- [ ] Frontend displays errors appropriately
- [ ] Responsive design works on mobile

---

## Error Handling

### Backend Error Responses

All errors follow consistent format:
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes Used
- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Error Middleware

Custom error handler catches all errors:
```javascript
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  if (status >= 500) {
    console.error('[ERROR]', err);
  }
  
  res.status(status).json({ error: message });
}
```

---

## Security Considerations

1. **Password Storage:** Bcrypt hashing with 10 rounds
2. **Token Expiration:** JWT tokens expire after 2 hours
3. **CORS:** Configured to allow frontend access
4. **SQL Injection:** Using parameterized queries
5. **XSS Prevention:** HTML escaping in frontend
6. **Environment Variables:** Sensitive data in .env file
7. **Authorization:** Owner-based access control for items

---

## Future Enhancements

- Email verification for registration
- Password reset functionality
- Task categories and tags
- Task due dates and reminders
- Search and filter capabilities
- User profile management
- Task sharing between users
- Real-time updates with WebSockets
- Mobile application
- Unit and integration tests

---

## Contact

**Authors:** Diego y Arturo  
**Repository:** https://github.com/WebbiestStew/acts-fullstack  
**Date:** February 6, 2026
