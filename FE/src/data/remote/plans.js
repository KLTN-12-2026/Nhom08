import apiClient from "../interceptor";

const plansAPI = {
    // POST /api/plans - Generate a new plan based on budget and activity groups
    generatePlan: async (payload) => {
        const response = await apiClient.post("/plans", payload);
        return response.data;
    },

    // POST /api/plans/save - Save a new plan
    saveNewPlan: async (payload) => {
        const response = await apiClient.post("/plans/save", payload);
        return response.data;
    },

    // GET /api/plans/saved - Get all saved plans
    getSavedPlans: async (params = {}) => {
        const response = await apiClient.get("/plans/saved", { params });
        return response.data;
    },

    // DELETE /api/plans/{planId} - Delete a saved plan
    deletePlan: async (planId) => {
        const response = await apiClient.delete(`/plans/${planId}`);
        return response.data;
    }
};

export default plansAPI;
