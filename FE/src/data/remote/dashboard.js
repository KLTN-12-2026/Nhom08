import apiClient from "../interceptor";

export const dashboard = {
    getDashboardData: async () => {
        const response = await apiClient.get("/admin/dashboard");
        return response.data;
    },
};
