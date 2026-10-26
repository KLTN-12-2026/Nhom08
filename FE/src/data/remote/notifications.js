import apiClient from "../interceptor";

// Admin notification APIs
export const notificationsAdmin = {
  // GET /api/admin/notifications - Get all notifications (with filter, pagination)
  getNotifications: async (params = {}) => {
    const res = await apiClient.get("/admin/notifications", { params });
    return res.data;
  },

  // GET /api/admin/notifications/{id} - Get notification detail
  getDetail: async (id) => {
    const res = await apiClient.get(`/admin/notifications/${id}`);
    return res.data;
  },

  // POST /api/admin/notifications/send-to-user - Send notification to 1 user
  sendToUser: async (payload) => {
    const res = await apiClient.post("/admin/notifications/send-to-user", payload);
    return res.data;
  },

  // POST /api/admin/notifications/send-to-users - Send notification to multiple users
  sendToUsers: async (payload) => {
    const res = await apiClient.post("/admin/notifications/send-to-users", payload);
    return res.data;
  },

  // POST /api/admin/notifications/broadcast - Send broadcast to all active users
  broadcast: async (payload) => {
    const res = await apiClient.post("/admin/notifications/broadcast", payload);
    return res.data;
  },

  // DELETE /api/admin/notifications/{id} - Delete notification
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/notifications/${id}`);
    return res.data;
  },
};

