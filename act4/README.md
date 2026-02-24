# Act 4 - Node.js Express JWT MongoDB Car Inventory Application

Full-stack Node.js application with Express.js, JWT authentication, MongoDB database for managing car inventory, and comprehensive testing.

## Features

- ✅ RESTful API with Express.js
- 🔐 JWT Authentication & Authorization
- 📦 MongoDB with Mongoose ODM
- 🧪 Unit Testing with Jest
- 🎨 Responsive Frontend UI
- 🚀 Vercel Deployment Ready
- 🔄 CI/CD with GitHub Actions

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Testing:** Jest, Supertest
- **Deployment:** Vercel

## Project Structure

```
act4/
├── config/            # Configuration files
│   ├── database.js    # MongoDB connection
│   └── jwt.js         # JWT configuration
├── controllers/       # Request handlers
│   ├── authController.js
│   └── carController.js
├── middleware/        # Custom middleware
│   ├── auth.js        # JWT authentication
│   └── errorHandler.js
├── models/            # Mongoose models
│   ├── User.js
│   └── Car.js
├── routes/            # API routes
│   ├── auth.js
│   └── cars.js
├── public/            # Static files
│   ├── index.html     # Login page
│   └── dashboard.html # Car inventory dashboard
├── tests/             # Jest tests
│   ├── auth.test.js
│   └── cars.test.js
├── .env.example       # Environment variables template
├── server.js          # Main application file
├── package.json
└── vercel.json        # Vercel configuration
```

## Installation

1. Clone the repository:
```bash
cd act4
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/act4_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Make sure MongoDB is running locally or use MongoDB Atlas

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Cars
All car routes require authentication (Bearer token)

- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes:
- Authentication tests (register, login, token validation)
- Product CRUD operation tests
- Authorization tests
- Error handling tests

## Frontend Usage

1. Open `http://localhost:3000` in your browser
2. Register a new account or login
3. Manage products from the dashboard

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB connection string (use MongoDB Atlas)
   - `JWT_SECRET` - Your JWT secret key
   - `JWT_EXPIRE` - Token expiration time
   - `NODE_ENV` - Set to `production`

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in Vercel
4. Whitelist Vercel IP addresses or use `0.0.0.0/0` for development

## CI/CD Pipeline

GitHub Actions workflow automatically:
- Runs tests on push/pull request
- Checks code quality
- Deploys to Vercel on main branch

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with middleware
- User authorization for resource ownership
- Input validation
- Error handling middleware

## License

ISC

## Author

Your Name
