const Task = require('../models/Task');

/**
 * GET /api/tasks
 * Lista tareas con paginación, filtros y búsqueda
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    // Admins ven todas las tareas; usuarios solo las suyas
    if (req.user.role !== 'admin') {
      filter.owner = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Obtiene una tarea por ID
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    // Usuarios solo ven sus propias tareas
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para ver esta tarea.' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 * Crea una nueva tarea
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignedTo: assignedTo || null,
      owner: req.user._id,
    });

    await task.populate('owner', 'name email');

    res.status(201).json({ success: true, message: 'Tarea creada exitosamente.', data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Actualiza una tarea completa
 */
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    // Usuarios solo pueden editar sus propias tareas
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta tarea.' });
    }

    const { title, description, status, priority, category, dueDate, assignedTo } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, category, dueDate, assignedTo },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({ success: true, message: 'Tarea actualizada.', data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Elimina una tarea
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    // Usuarios solo pueden eliminar sus propias tareas; admins pueden eliminar cualquiera
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta tarea.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Tarea eliminada exitosamente.' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Cambia únicamente el estado de una tarea
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${allowedStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta tarea.' });
    }

    task.status = status;
    await task.save();
    await task.populate('owner', 'name email');

    res.status(200).json({ success: true, message: 'Estado actualizado.', data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/stats  (solo admin)
 * Estadísticas generales de tareas
 */
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const total = await Task.countDocuments();

    res.status(200).json({
      success: true,
      data: { total, byStatus: stats, byPriority: priorityStats },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, getTaskStats };
