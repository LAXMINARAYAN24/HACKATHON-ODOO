import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isInitialized: false,

  // Called on successful login or signup
  login: (user, token) => {
    localStorage.setItem("af_token", token);
    localStorage.setItem("af_user", JSON.stringify(user));
    set({ user, token, isInitialized: true });
  },

  // Clear auth state and storage
  logout: () => {
    localStorage.removeItem("af_token");
    localStorage.removeItem("af_user");
    set({ user: null, token: null, isInitialized: true });
  },

  /**
   * initAuth — called once on app load.
   * Correction 4: Validates stored token via GET /api/auth/me.
   * If the token is missing, expired, or invalid → clears auth.
   * Only trusts the server response, not localStorage alone.
   */
  initAuth: async () => {
    const storedToken = localStorage.getItem("af_token");

    if (!storedToken) {
      set({ user: null, token: null, isInitialized: true });
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (response.data?.success && response.data?.data?.user) {
        set({
          user: response.data.data.user,
          token: storedToken,
          isInitialized: true,
        });
      } else {
        get().logout();
      }
    } catch (error) {
      // Token invalid, expired, or server error — clear auth
      get().logout();
    }
  },
}));

export default useAuthStore;
