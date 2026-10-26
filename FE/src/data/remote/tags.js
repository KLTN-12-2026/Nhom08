import apiClient from "../interceptor";

const tagsAPI = {
    // GET /api/admin/tags - Get all tags
    getTags: async (params = {}) => {
        const response = await apiClient.get("/admin/tags", { params });
        return response.data;
    },

    // POST /api/admin/tags - Create new tag
    createTag: async (tagData) => {
        const response = await apiClient.post("/admin/tags", tagData);
        return response.data;
    },

    // GET /api/admin/tags/{tag} - Get tag details
    getTagById: async (tagId) => {
        const response = await apiClient.get(`/admin/tags/${tagId}`);
        return response.data;
    },

    // PUT /api/admin/tags/{tag} - Update tag
    updateTag: async (tagId, tagData) => {
        const response = await apiClient.put(`/admin/tags/${tagId}`, tagData);
        return response.data;
    },

    // DELETE /api/admin/tags/{tag} - Delete tag
    deleteTag: async (tagId) => {
        const response = await apiClient.delete(`/admin/tags/${tagId}`);
        return response.data;
    },
};

export default tagsAPI;
