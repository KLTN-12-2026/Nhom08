import apiClient from "../interceptor";

export const activityGroups = {
    getGroups: async (params = {}) => {
        const response = await apiClient.get("/activity-groups", { params });
        return response.data;
    },

    createGroup: async (groupData) => {
        const response = await apiClient.post("/admin/activity-groups", groupData);
        return response.data;
    },

    getGroupById: async (id) => {
        const response = await apiClient.get(`/admin/activity-groups/${id}`);
        return response.data;
    },

    updateGroup: async (id, groupData) => {
        const response = await apiClient.put(`/admin/activity-groups/${id}`, groupData);
        return response.data;
    },

    deleteGroup: async (id) => {
        const response = await apiClient.delete(`/admin/activity-groups/${id}`);
        return response.data;
    },

    syncCategories: async (id, categories) => {
        const response = await apiClient.post(`/admin/activity-groups/${id}/categories`, {
            categories,
        });
        return response.data;
    },
};
