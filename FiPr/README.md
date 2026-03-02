# AutoVault — Car Inventory System

A full-stack car inventory management application built with **Node.js + Express + MongoDB** (backend) and **React + Vite** (frontend).

---

## Features

- JWT authentication with role-based access (user / admin)
- Full CRUD for car listings
- Advanced filter & search: make, status, condition, fuel type, price/year range, keyword
- Pagination support on all list endpoints
- Admin panel: inventory analytics, user management, role promotion/demotion
- Responsive dark-themed UI (no excessive gradients)
- 10+ Jest integration tests

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Node.js 20, Express 4, Mongoose 8       |
| Database | MongoDB 7                               |
| Auth     | JWT (jsonwebtoken), bcryptjs            |
| Frontend | React 18, Vite 5, React Router v6, Axios|
| Testing  | Jest 29, supertest, mongodb-memory-server|

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

### Backend

```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET if needed
npm run seed           # optional: seed sample data
npm start
```

Backend runs on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
# create frontend/.env with: VITE_API_URL=http://localhost:3000/api
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Tests

```bash
cd backend
npm test
```

---

## API Endpoints

### Auth  (`/api/auth`)

| Method | Endpoint              | Auth     | Description            |
|--------|-----------------------|----------|------------------------|
| POST   | /register             | —        | Create account         |
| POST   | /login                | —        | Login, receive token   |
| GET    | /me                   | user     | Get current user       |
| GET    | /users                | admin    | List all users         |
| PATCH  | /users/:id/role       | admin    | Update user role       |

### Cars  (`/api/cars`)

| Method | Endpoint              | Auth     | Description                        |
|--------|-----------------------|----------|------------------------------------|
| GET    | /                     | user     | List cars (paginated, filterable)  |
| GET    | /stats                | admin    | Inventory analytics                |
| GET    | /:id                  | user     | Get single car                     |
| POST   | /                     | user     | Create car listing                 |
| PUT    | /:id                  | user     | Update car (owner or admin)        |
| PATCH  | /:id/status           | user     | Update car status                  |
| DELETE | /:id                  | user     | Delete car (owner or admin)        |

### Query Parameters for `GET /api/cars`

| Param       | Example            | Description                    |
|-------------|--------------------|--------------------------------|
| page        | `?page=2`          | Page number (default: 1)       |
| limit       | `?limit=10`        | Items per page (default: 12)   |
| status      | `?status=available`| Filter by status               |
| condition   | `?condition=new`   | Filter by condition            |
| fuelType    | `?fuelType=electric`| Filter by fuel type           |
| transmission| `?transmission=manual` | Filter by transmission    |
| make        | `?make=Toyota`     | Filter by make                 |
| minPrice    | `?minPrice=10000`  | Minimum price                  |
| maxPrice    | `?maxPrice=50000`  | Maximum price                  |
| minYear     | `?minYear=2020`    | Minimum year                   |
| maxYear     | `?maxYear=2024`    | Maximum year                   |
| search      | `?search=camry`    | Keyword search (make/model/desc)|
| sortBy      | `?sortBy=price`    | Sort field                     |
| sortOrder   | `?sortOrder=asc`   | asc or desc                    |

---

## Seed Accounts (after running `npm run seed`)

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@autovault.com      | admin123  |
| User  | carlos@example.com       | user1234  |
| User  | sofia@example.com        | user1234  |

---

## Project Structure

```
FiPr/
├── backend/
│   ├── controllers/   authController.js, carController.js
│   ├── middleware/    auth.js, errorHandler.js, validate.js
│   ├── models/        User.js, Car.js
│   ├── routes/        auth.js, cars.js
│   ├── tests/         auth.test.js, cars.test.js
│   ├── seed.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/  Navbar, CarCard, Pagination, PrivateRoute
│       ├── context/     AuthContext
│       ├── pages/       Login, Register, Dashboard, Cars, CarDetail, CarForm, Admin, NotFound
│       └── services/    api.js, authService.js, carService.js
└── database-model/
    ├── schema.js
    └── ER-diagram.md
```
