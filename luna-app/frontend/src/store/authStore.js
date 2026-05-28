import { create } from 'zustand';
import storage from '../utils/storage';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await storage.getItem('luna_token');
      if (token) {
        const res = await authAPI.getMe();
        set({ user: res.data.user, token, isAuthenticated: true });
      }
    } catch {
      await storage.removeItem('luna_token');
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login with:', email);
      const res = await authAPI.login({ email, password });
      console.log('Login response:', res.data);
      const { token, user } = res.data;
      await storage.setItem('luna_token', token);
      console.log('Token saved to storage');
      set({ user, token, isAuthenticated: true, isLoading: false });
      console.log('Auth state updated - isAuthenticated: true');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || err.message || 'Login failed' };
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.signup(data);
      const { token, user } = res.data;
      await storage.setItem('luna_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  },

  logout: async () => {
    await storage.removeItem('luna_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => set({ user }),
}));
