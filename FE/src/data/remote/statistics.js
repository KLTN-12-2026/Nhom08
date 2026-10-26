import apiClient from "../interceptor";

export const statistics = {
    getUsersStats: async (params) => {
        const response = await apiClient.get("/admin/statistics/users", { params });
        return response.data;
    },

    getPlacesStats: async (params) => {
        const response = await apiClient.get("/admin/statistics/places", { params });
        return response.data;
    },

    getTransactionsStats: async (params) => {
        const response = await apiClient.get("/admin/statistics/transactions", { params });
        return response.data;
    },

    getGeneralStats: async () => {
        const response = await apiClient.get("/admin/statistics/general");
        return response.data;
    },
};
