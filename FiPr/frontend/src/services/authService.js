import api from './api.js';

const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  changeRole: (userId, role) => api.patch(`/auth/users/${userId}/role`, { role }),
};

export default authService;
