import { create } from 'zustand';
import { periodAPI } from '../services/api';

export const useCycleStore = create((set, get) => ({
  logs: [],
  predictions: null,
  isLoading: false,

  fetchLogs: async (params) => {
    set({ isLoading: true });
    try {
      const res = await periodAPI.getLogs(params);
      set({ logs: res.data.logs, isLoading: false });
      return res.data;
    } catch (err) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  fetchPredictions: async () => {
    try {
      const res = await periodAPI.getPredictions();
      set({ predictions: res.data.predictions });
      return res.data.predictions;
    } catch {
      return null;
    }
  },

  createLog: async (data) => {
    set({ isLoading: true });
    try {
      const res = await periodAPI.createLog(data);
      const newLog = res.data.log;
      set((state) => ({
        logs: [newLog, ...state.logs],
        predictions: res.data.predictions,
        isLoading: false,
      }));
      return { success: true, data: res.data };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Failed to save log' };
    }
  },

  updateLog: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await periodAPI.updateLog(id, data);
      const updated = res.data.log;
      set((state) => ({
        logs: state.logs.map((l) => l._id === id ? updated : l),
        predictions: res.data.predictions || state.predictions,
        isLoading: false,
      }));
      return { success: true, data: res.data };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Failed to update log' };
    }
  },

  deleteLog: async (id) => {
    console.log('Frontend: Attempting to delete log with id:', id);
    set({ isLoading: true });
    try {
      const response = await periodAPI.deleteLog(id);
      console.log('Frontend: Delete response:', response.data);
      set((state) => ({ 
        logs: state.logs.filter((l) => l._id !== id),
        isLoading: false 
      }));
      await get().fetchPredictions();
      return { success: true };
    } catch (err) {
      console.error('Frontend: Delete log error:', err.response?.data || err.message);
      set({ isLoading: false });
      return { success: false, message: err.response?.data?.message || 'Failed to delete log' };
    }
  },
}));
