import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('luna_token');
      if (token) {
        const res = await authAPI.getMe();
        set({ user: res.data.user, token, isAuthenticated: true });
      }
    } catch {
      await AsyncStorage.removeItem('luna_token');
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      await AsyncStorage.setItem('luna_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.signup(data);
      const { token, user } = res.data;
      await AsyncStorage.setItem('luna_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('luna_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => set({ user }),
}));
