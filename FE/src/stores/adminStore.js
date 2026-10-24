import { create } from "zustand";

const useAdminStore = create((set, get) => ({
  // Dashboard data
  dashboardStats: null,
  isLoading: false,
  error: null,

  // Users management
  users: [],
  usersLoading: false,
  usersError: null,
  totalUsers: 0,
  currentPage: 1,
  pageSize: 10,

  // Actions
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Users actions
  setUsers: (users) => set({ users }),
  setUsersLoading: (loading) => set({ usersLoading: loading }),
  setUsersError: (error) => set({ usersError: error }),
  setTotalUsers: (total) => set({ totalUsers: total }),
  setCurrentPage: (page) => set({ currentPage: page }),

  // Reset functions
  resetDashboard: () => {
    set({
      dashboardStats: null,
      isLoading: false,
      error: null,
    });
  },

  resetUsers: () => {
    set({
      users: [],
      usersLoading: false,
      usersError: null,
      totalUsers: 0,
      currentPage: 1,
    });
  },
}));

export default useAdminStore;
