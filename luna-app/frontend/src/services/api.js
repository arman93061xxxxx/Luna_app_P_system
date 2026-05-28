import axios from 'axios';
import storage from '../utils/storage';

// Production backend URL
const BASE_URL = 'https://luna-api-797x.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  const token = await storage.getItem('luna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token attached to request');
  }
  return config;
});

// Log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Period Logs
export const periodAPI = {
  getLogs: (params) => api.get('/periods', { params }),
  createLog: (data) => api.post('/periods', data),
  updateLog: (id, data) => api.put(`/periods/${id}`, data),
  deleteLog: (id) => api.delete(`/periods/${id}`),
  getPredictions: () => api.get('/periods/predictions/latest'),
};

// AI
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
  chat: (message, history) => api.post('/ai/chat', { message, history }),
};

export default api;
