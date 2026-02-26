const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Validaciones para crear/actualizar tarea
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El título debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede superar 500 caracteres'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Estado inválido'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Prioridad inválida'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Fecha inválida (formato ISO8601)'),
];

// Todas las rutas requieren autenticación
router.use(protect);

// @route   GET /api/tasks/stats
// @access  Admin
router.get('/stats', authorize('admin'), getTaskStats);

// @route   GET /api/tasks
// @access  Private (admin ve todas, user ve las suyas)
router.get('/', getTasks);

// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', getTaskById);

// @route   POST /api/tasks
// @access  Private
router.post('/', taskValidation, validate, createTask);

// @route   PUT /api/tasks/:id
// @access  Private
router.put('/:id', taskValidation, validate, updateTask);

// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', deleteTask);

// @route   PATCH /api/tasks/:id/status
// @access  Private
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
