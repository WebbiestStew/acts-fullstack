const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { config } = require('../config');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  res.status(201).json({ user: result.rows[0] });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: '2h'
  });

  res.json({ token });
}));

module.exports = router;
