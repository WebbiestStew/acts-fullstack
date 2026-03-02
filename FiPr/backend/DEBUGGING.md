# Debugging Guide — AutoVault Backend

## 1. Enable Verbose Logging

Set `NODE_ENV=development` in your `.env` file (it is the default).  
When the environment is `development`, the global error handler prints the full stack trace to `stdout` for every 500 error:

```js
// middleware/errorHandler.js
if (process.env.NODE_ENV === 'development') {
  console.error(err.stack);
}
```

To switch to production mode (stack traces hidden):

```
NODE_ENV=production
```

---

## 2. Common HTTP Error Codes

| Code | Meaning | Cause |
|------|---------|-------|
| `400` | Bad Request | Malformed JSON body or missing required field |
| `401` | Unauthorized | No `Authorization` header or JWT is expired/invalid |
| `403` | Forbidden | User is authenticated but lacks the required role (admin-only route) |
| `404` | Not Found | Car or user ID does not exist in the database |
| `409` | Conflict | Duplicate value — email already registered or VIN already exists |
| `422` | Unprocessable Entity | express-validator rejected one or more fields; check the `errors` array in the response |
| `500` | Internal Server Error | Unexpected server-side failure; full stack shown when `NODE_ENV=development` |

---

## 3. Debugging Authentication Issues

### "401 — No token provided"
Make sure every protected request includes the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### "401 — Token expired"
Tokens are valid for **7 days** (controlled by `JWT_EXPIRES_IN` in `.env`).  
Login again to receive a fresh token.

### "403 — Not authorized for this role"
The endpoint requires `admin` role.  
Promote the account first via `PATCH /api/auth/users/:id/role` with an admin token, or use the seed admin account:

```
Email:    admin@autovault.com
Password: admin123
```

---

## 4. Debugging Validation Errors (422)

The response body includes a detailed `errors` array:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "year", "message": "Year must be between 1900 and 2025" },
    { "field": "price", "message": "Price must be a positive number" }
  ]
}
```

Check valid values in `middleware/validate.js`.

---

## 5. Running Tests with Verbose Output

```bash
cd backend
npm test -- --verbose
```

This shows every `describe` / `test` name and its pass/fail status:

```
  Auth Routes
    ✓ should register a new user (120 ms)
    ✓ should login with correct credentials (80 ms)
    ✗ should reject duplicate email
      ...
  Car Routes
    ✓ should create a car (95 ms)
    ...
```

To run a single test file:

```bash
npm test -- tests/cars.test.js --verbose
```

To run a single named test:

```bash
npm test -- --testNamePattern="should create a car" --verbose
```

---

## 6. Debugging MongoDB Connection

If the server fails to start with `MongooseServerSelectionError`, MongoDB is not running locally. Start it with:

```bash
# macOS (Homebrew)
brew services start mongodb-community
```

Verify the URI in `.env`:

```
MONGO_URI=mongodb://localhost:27017/car-inventory
```

To inspect the database directly:

```bash
mongosh car-inventory
db.cars.find().pretty()
db.users.find({}, { password: 0 }).pretty()
```

---

## 7. Resetting the Database

Use the seed script to wipe and repopulate with test data:

```bash
npm run seed
```

This creates:
- `admin@autovault.com` / `admin123` (role: admin)
- `carlos@example.com` / `user1234` (role: user)
- `sofia@example.com` / `user1234` (role: user)
- 8 sample cars spread across the three accounts

---

## 8. Environment Variable Checklist

```
PORT          – server port (default 3000)
MONGO_URI     – full MongoDB connection string
JWT_SECRET    – strong random string, keep secret
JWT_EXPIRES_IN– token lifetime, e.g. 7d
NODE_ENV      – development | production
FRONTEND_URL  – CORS allowed origin (e.g. http://localhost:5173)
```

Copy `.env.example` to `.env` and fill in real values before starting.
