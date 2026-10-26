import apiClient from "../interceptor";

export const userData = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post("/admin/users", userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
  toggleBlockUser: async (userId, block) => {
    const response = await apiClient.post(`/admin/users/${userId}/block`, {
      block,
    });
    return response.data;
  },
};
