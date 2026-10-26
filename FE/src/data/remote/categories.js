import apiClient from "../interceptor";

const categoriesAPI = {
    // GET /api/admin/categories - Get all categories
    getCategories: async (params = {}) => {
        const response = await apiClient.get("/admin/categories", { params });
        return response.data;
    },

    // POST /api/admin/categories - Create new category
    createCategory: async (data) => {
        const response = await apiClient.post("/admin/categories", data);
        return response.data;
    },

    // GET /api/admin/categories/{id} - Get category details
    getCategoryById: async (id) => {
        const response = await apiClient.get(`/admin/categories/${id}`);
        return response.data;
    },

    // PUT /api/admin/categories/{id} - Update category
    updateCategory: async (id, data) => {
        const response = await apiClient.put(`/admin/categories/${id}`, data);
        return response.data;
    },

    // DELETE /api/admin/categories/{id} - Delete category
    deleteCategory: async (id) => {
        const response = await apiClient.delete(`/admin/categories/${id}`);
        return response.data;
    },
};

export default categoriesAPI;
