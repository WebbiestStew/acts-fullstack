const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { JWT_SECRET } = require('../middleware/autenticacion');

const router = express.Router();
const usersPath = path.join(__dirname, '../usuarios.json');

/**
 * Helper function to read users from JSON file
 */
async function readUsers() {
  try {
    const data = await fs.readFile(usersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Helper function to save users to JSON file
 */
async function saveUsers(users) {
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * POST /register - Register new users
 * Body: { username, password, email }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    // Data validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Incomplete data',
        message: 'Username and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Read existing users
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'Username is already registered' 
      });
    }

    // Encrypt password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      email: email || '',
      password: passwordHash,
      registrationDate: new Date().toISOString()
    };

    // Add user to array
    users.push(newUser);

    // Save to file
    await saveUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond without sending password
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /login - User login
 * Body: { username, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Data validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Incomplete data',
        message: 'Username and password are required' 
      });
    }

    // Read users
    const users = await readUsers();

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect username or password' 
      });
    }

    // Verify password with bcryptjs
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect username or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond with token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
