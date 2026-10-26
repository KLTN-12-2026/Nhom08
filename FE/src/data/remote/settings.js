import apiClient from "../interceptor";

const settingsAPI = {
    getUserLimitsStatus: async () => {
        const response = await apiClient.get("/admin/user-limits");
        return response.data;
    },
    updateUserLimits: async (enabled) => {
        const response = await apiClient.put("/admin/user-limits", { enabled });
        return response.data;
    },
    // Place Auto Approve Settings
    getPlaceAutoApproveConfig: async () => {
        const response = await apiClient.get("/admin/place-config/auto-approve");
        return response.data;
    },
    togglePlaceAutoApprove: async (enabled) => {
        const response = await apiClient.post("/admin/place-config/auto-approve/toggle", { enabled });
        return response.data;
    },
};

export default settingsAPI;
