# Quick Start Guide - Act 4 Car Inventory Management

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd act4
npm install
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your local machine:

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
- MongoDB should start automatically, or use MongoDB Compass

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 3: Start the Application
```bash
npm run dev
```

The server will start on http://localhost:3000

### Step 4: Test the Application

Open your browser and go to: **http://localhost:3000**

1. **Register a new user:**
   - Click on "Register" tab
   - Fill in username, email, and password
   - Click "Register"

2. **You'll be redirected to the dashboard**
   - Click "Add Car" to create cars
   - Manage your car inventory (Edit/Delete)

### Step 5: Test the API

Using curl or Postman:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response!

**Create Car:**
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "brand":"Toyota",
    "model":"Camry",
    "year":2023,
    "price":28500,
    "mileage":15000,
    "color":"Silver",
    "transmission":"Automatic",
    "fuelType":"Gasoline",
    "condition":"Used"
  }'
```

**Get All Cars:**
```bash
curl http://localhost:3000/api/cars \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🧪 Running Tests

```bash
npm test
```

Expected output: All tests should pass ✅

## 📁 Project Structure

```
act4/
├── config/              # Database and JWT configuration
├── controllers/         # Business logic
├── middleware/          # Authentication and error handling
├── models/             # MongoDB schemas
├── routes/             # API endpoints
├── public/             # Frontend HTML files
├── tests/              # Jest unit tests
├── .github/workflows/  # CI/CD pipeline
├── server.js           # Main entry point
└── package.json        # Dependencies
```

## 🔑 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Authentication (Private)
- `GET /api/auth/me` - Get current user info

### Products (All Private - Require Bearer Token)
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car
- `PUT /api/cars/:id` - Update car (owner only)
- `DELETE /api/cars/:id` - Delete car (owner only)

## 🛠️ Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |

## ⚙️ Environment Variables

Edit `.env` file to configure:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/act4_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Change PORT in .env file
PORT=3001
```

**MongoDB connection error?**
```bash
# Make sure MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux
```

**Tests failing?**
```bash
# Use a different test database
export MONGODB_URI_TEST=mongodb://localhost:27017/act4_test_db
npm test
```

## 📚 Next Steps

- ✅ Add more car details (VIN tracking)
- ✅ Implement image upload for cars
- ✅ Add search and filtering by brand/model
- ✅ Deploy to Vercel
- ✅ Set up GitHub Actions

## 🚀 Deploy to Production

See [DEPLOYMENT_GUIDE.md](.github/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

Quick deploy to Vercel:
```bash
npm i -g vercel
vercel
```

---

**Need help?** Check the [README.md](README.md) for more detailed information.
