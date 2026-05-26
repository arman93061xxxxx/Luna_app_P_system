import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production backend URL — update this after deploying to Render
// For local testing on emulator: http://10.0.2.2:5000/api
// For local testing on physical device: http://YOUR_PC_IP:5000/api
const BASE_URL = 'https://luna-api-797x.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('luna_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
