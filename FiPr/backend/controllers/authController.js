const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Genera un token JWT firmado con el id del usuario
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/register
 * Crea un nuevo usuario (rol 'user' por defecto)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado.' });
    }

    // Solo los admins pueden crear otros admins
    const assignedRole = role === 'admin' ? 'user' : (role || 'user');

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Autentica un usuario y devuelve JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    if (!user.active) {
      return res.status(401).json({ success: false, message: 'Cuenta desactivada.' });
    }

    const token = signToken(user._id);

    // Don't send password in response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login exitoso.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/users  (solo admin)
 * Lista todos los usuarios
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/users/:id/role  (solo admin)
 * Cambia el rol de un usuario
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rol inválido.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    res.status(200).json({ success: true, message: 'Rol actualizado.', user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getAllUsers, changeUserRole };
