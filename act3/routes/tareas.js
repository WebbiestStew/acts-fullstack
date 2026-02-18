const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/autenticacion');

const router = express.Router();
const tasksPath = path.join(__dirname, '../tareas.json');

/**
 * Helper function to read tasks from JSON file
 */
async function getTasks() {
  try {
    const data = await fs.readFile(tasksPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Helper function to save tasks to JSON file
 */
async function saveTasks(tasks) {
  await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2), 'utf8');
}

/**
 * GET /tareas - Get all tasks
 * Requires authentication
 */
router.get('/tareas', authenticateToken, async (req, res, next) => {
  try {
    const tasks = await getTasks();
    
    // Filter tasks for authenticated user
    const userTasks = tasks.filter(t => t.userId === req.user.id);
    
    res.status(200).json({
      message: 'Tasks retrieved successfully',
      total: userTasks.length,
      tasks: userTasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /tareas/:id - Get a specific task by ID
 * Requires authentication
 */
router.get('/tareas/:id', authenticateToken, async (req, res, next) => {
  try {
    const tasks = await getTasks();
    const taskId = parseInt(req.params.id);
    
    const task = tasks.find(t => t.id === taskId && t.userId === req.user.id);
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Task not found' 
      });
    }
    
    res.status(200).json({
      message: 'Task found',
      task: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /tareas - Create a new task
 * Body: { title, description }
 * Requires authentication
 */
router.post('/tareas', authenticateToken, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    // Data validation
    if (!title) {
      return res.status(400).json({ 
        error: 'Incomplete data',
        message: 'Title is required' 
      });
    }

    // Read existing tasks
    const tasks = await getTasks();
    
    // Create new task
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title,
      description: description || '',
      completed: false,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add task to array
    tasks.push(newTask);
    
    // Save to file
    await saveTasks(tasks);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /tareas/:id - Update an existing task
 * Body: { title?, description?, completed? }
 * Requires authentication
 */
router.put('/tareas/:id', authenticateToken, async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, completed } = req.body;
    
    // Read tasks
    const tasks = await getTasks();
    
    // Find task index
    const index = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    
    if (index === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Task not found or you do not have permission to modify it' 
      });
    }
    
    // Update only provided fields
    if (title !== undefined) tasks[index].title = title;
    if (description !== undefined) tasks[index].description = description;
    if (completed !== undefined) tasks[index].completed = completed;
    tasks[index].updatedAt = new Date().toISOString();
    
    // Save changes
    await saveTasks(tasks);
    
    res.status(200).json({
      message: 'Task updated successfully',
      task: tasks[index]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /tareas/:id - Delete a task
 * Requires authentication
 */
router.delete('/tareas/:id', authenticateToken, async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    
    // Read tasks
    const tasks = await getTasks();
    
    // Find task index
    const index = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    
    if (index === -1) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Task not found or you do not have permission to delete it' 
      });
    }
    
    // Delete task
    const deletedTask = tasks.splice(index, 1)[0];
    
    // Save changes
    await saveTasks(tasks);
    
    res.status(200).json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
