import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  login: async (identifier, password) => {
    try {
      const res = await api.post("/auth/login", { identifier, password });
      await get().fetchUser();
      return { success: true, data: res.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed",
        data: error.response?.data
      };
    }
  },

  signup: async (userData) => {
    try {
      const res = await api.post("/auth/signup", userData);
      await get().fetchUser();
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Signup failed" };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  fetchUser: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return res.data.user;
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  }
}));

export default useAuthStore;

