const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getCars,
  getCarStats,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validation rules for creating / updating a car
const carValidation = [
  body('make')
    .trim()
    .notEmpty()
    .withMessage('Make is required')
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required')
    .isLength({ max: 30 })
    .withMessage('Color cannot exceed 30 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('mileage')
    .notEmpty()
    .withMessage('Mileage is required')
    .isFloat({ min: 0 })
    .withMessage('Mileage must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['available', 'sold', 'reserved', 'maintenance'])
    .withMessage('Status must be one of: available, sold, reserved, maintenance'),
  body('condition')
    .optional()
    .isIn(['new', 'used', 'certified'])
    .withMessage('Condition must be one of: new, used, certified'),
  body('fuelType')
    .optional()
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid'])
    .withMessage('Fuel type must be one of: gasoline, diesel, electric, hybrid'),
  body('transmission')
    .optional()
    .isIn(['automatic', 'manual'])
    .withMessage('Transmission must be automatic or manual'),
  body('vin')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/i)
    .withMessage('VIN contains invalid characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

// All routes require authentication
router.use(protect);

// @route   GET /api/cars/stats
// @access  Admin only
router.get('/stats', authorize('admin'), getCarStats);

// @route   GET /api/cars
// @access  Private (admin sees all, user sees their own)
router.get('/', getCars);

// @route   GET /api/cars/:id
// @access  Private
router.get('/:id', getCarById);

// @route   POST /api/cars
// @access  Private
router.post('/', carValidation, validate, createCar);

// @route   PUT /api/cars/:id
// @access  Private
router.put('/:id', carValidation, validate, updateCar);

// @route   DELETE /api/cars/:id
// @access  Private
router.delete('/:id', deleteCar);

// @route   PATCH /api/cars/:id/status
// @access  Private
router.patch('/:id/status', updateCarStatus);

module.exports = router;
