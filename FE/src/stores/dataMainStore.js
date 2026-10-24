import { create } from "zustand";
import { persist } from "zustand/middleware";

const useDataMainStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      user: null,
      token: null,
      refreshToken: null,
      tokenExpired: null,
      refreshTokenExpired: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ user }),

      setToken: (tokenData) => {
        const { token, refreshToken, tokenExpired, refreshTokenExpired } =
          tokenData;
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

      isTokenExpired: () => {
        const { token, tokenExpired } = get();
        if (!token) return true;
        if (!tokenExpired) return false;
        return new Date() >= new Date(tokenExpired);
      },

      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      updateProfile: (profileData) => {
        const { user } = get();
        set({ user: { ...user, ...profileData } });
      },

      // Custom user posts state for frontend demonstration
      posts: [],

      addPost: (post) => {
        const { posts } = get();
        set({ posts: [post, ...posts] });
      },

      deletePost: (id) => {
        const { posts } = get();
        set({ posts: posts.filter(p => p.id !== id) });
      }
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        tokenExpired: state.tokenExpired,
        refreshTokenExpired: state.refreshTokenExpired,
        isAuthenticated: state.isAuthenticated,
        posts: state.posts,
      }),
    }
  )
);

export default useDataMainStore;
