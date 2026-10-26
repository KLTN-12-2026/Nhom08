import apiClient from "../interceptor";

// User ticket APIs
export const ticketsUser = {
  // POST /api/tickets - Create ticket
  create: async (payload) => {
    const res = await apiClient.post("/tickets", payload);
    return res.data;
  },

  // GET /api/tickets - Get my tickets
  getMyTickets: async (params = {}) => {
    const res = await apiClient.get("/tickets", { params });
    return res.data;
  },

  // GET /api/tickets/{id} - Get ticket detail
  getDetail: async (id) => {
    const res = await apiClient.get(`/tickets/${id}`);
    return res.data;
  },

  // PUT /api/tickets/{id} - Update ticket (only open)
  update: async (id, payload) => {
    const res = await apiClient.put(`/tickets/${id}`, payload);
    return res.data;
  },
};

// Admin ticket APIs
export const ticketsAdmin = {
  // GET /api/admin/tickets - List all tickets
  getTickets: async (params = {}) => {
    const res = await apiClient.get("/admin/tickets", { params });
    return res.data;
  },

  // GET /api/admin/tickets/{id} - Get ticket detail
  getDetail: async (id) => {
    const res = await apiClient.get(`/admin/tickets/${id}`);
    return res.data;
  },

  // PUT /api/admin/tickets/{id}/status - Update ticket status
  updateStatus: async (id, payload) => {
    const res = await apiClient.put(`/admin/tickets/${id}/status`, payload);
    return res.data;
  },

  // PUT /api/admin/tickets/{id}/assign - Assign/unassign admin
  assign: async (id, adminIdOrNull) => {
    const res = await apiClient.put(`/admin/tickets/${id}/assign`, {
      admin_id: adminIdOrNull,
    });
    return res.data;
  },

  // DELETE /api/admin/tickets/{id} - Delete ticket
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/tickets/${id}`);
    return res.data;
  },
};







