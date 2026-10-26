import apiClient from "../interceptor";

const announcementsAPI = {
    // GET /api/admin/announcements - Get all announcements
    getAnnouncements: async (params = {}) => {
        const response = await apiClient.get("/admin/announcements", { params });
        return response.data;
    },

    // POST /api/admin/announcements - Create new announcement
    createAnnouncement: async (data) => {
        const response = await apiClient.post("/admin/announcements", data);
        return response.data;
    },

    // GET /api/admin/announcements/{id} - Get announcement details
    getAnnouncementById: async (id) => {
        const response = await apiClient.get(`/admin/announcements/${id}`);
        return response.data;
    },

    // PUT /api/admin/announcements/{id} - Update announcement
    updateAnnouncement: async (id, data) => {
        const response = await apiClient.put(`/admin/announcements/${id}`, data);
        return response.data;
    },

    // DELETE /api/admin/announcements/{id} - Delete announcement
    deleteAnnouncement: async (id) => {
        const response = await apiClient.delete(`/admin/announcements/${id}`);
        return response.data;
    },
};

export default announcementsAPI;

