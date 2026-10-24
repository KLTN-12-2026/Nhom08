import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCustomerStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      tokenExpired: null,
      refreshTokenExpired: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setToken: (tokenData) => {
        const { token, refreshToken, tokenExpired, refreshTokenExpired } = tokenData;
        set({
          token,
          refreshToken,
          tokenExpired,
          refreshTokenExpired,
          isAuthenticated: !!token,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpired: null,
          refreshTokenExpired: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "customer-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpired: state.tokenExpired,
        refreshTokenExpired: state.refreshTokenExpired,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useCustomerStore;
