import api from './api.js';

const taskService = {
  /**
   * @param {Object} params - { page, limit, status, priority, category, search, sortBy, sortOrder }
   */
  getTasks: (params = {}) => api.get('/tasks', { params }),

  getTaskById: (id) => api.get(`/tasks/${id}`),

  createTask: (taskData) => api.post('/tasks', taskData),

  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),

  deleteTask: (id) => api.delete(`/tasks/${id}`),

  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  getStats: () => api.get('/tasks/stats'),
};

export default taskService;
