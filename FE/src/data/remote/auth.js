import apiClient from "./../interceptor";

export const auth = {
  login: async (credentials) => {
    const response = await apiClient.post("/login?platform=0", credentials);
    return response.data;
  },
  loginAdmin: async (credentials) => {
    const response = await apiClient.post("/admin/login", credentials);
    return response.data;
  },
  register: async (data) => {
    const response = await apiClient.post("/register", data);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post("/admin/logout");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await apiClient.put("/me", data);
    return response.data;
  },
  updateAvatar: async (formData) => {
    const response = await apiClient.post("/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/me");
    return response.data;
  },
  updatePassword: async (data) => {
    const response = await apiClient.post("/change-password", data);
    return response.data;
  },
};

