import api from './api.js';

const carService = {
  /**
   * Get all cars with pagination + filters
   * @param {Object} params - { page, limit, status, condition, fuelType, transmission, make, minPrice, maxPrice, minYear, maxYear, search, sortBy, sortOrder }
   */
  getCars: (params = {}) => api.get('/cars', { params }),

  getCarById: (id) => api.get(`/cars/${id}`),

  createCar: (carData) => api.post('/cars', carData),

  updateCar: (id, carData) => api.put(`/cars/${id}`, carData),

  deleteCar: (id) => api.delete(`/cars/${id}`),

  updateStatus: (id, status) => api.patch(`/cars/${id}/status`, { status }),

  getStats: () => api.get('/cars/stats'),
};

export default carService;
