const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  getMe,
  getAllUsers,
  changeUserRole,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validaciones para registro
const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Validaciones para login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, validate, login);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @route   GET /api/auth/users
// @access  Admin
router.get('/users', protect, authorize('admin'), getAllUsers);

// @route   PATCH /api/auth/users/:id/role
// @access  Admin
router.patch('/users/:id/role', protect, authorize('admin'), changeUserRole);

module.exports = router;
