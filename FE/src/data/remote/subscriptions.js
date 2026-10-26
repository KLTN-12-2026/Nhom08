// Subscriptions API module
import apiClient from "../interceptor";

const subscriptionsAPI = {
    // GET /api/admin/subscriptions - List all subscriptions with filters
    getSubscriptions: async (params = {}) => {
        const response = await apiClient.get("/admin/subscriptions", { params });
        return response.data;
    },

    // GET /api/admin/subscriptions/stats - Get subscription statistics
    getStats: async () => {
        const response = await apiClient.get("/admin/subscriptions/stats");
        return response.data;
    },

    // GET /api/admin/subscriptions/{id} - Get specific subscription details
    getSubscriptionById: async (subscriptionId) => {
        const response = await apiClient.get(`/admin/subscriptions/${subscriptionId}`);
        return response.data;
    },

    // GET /api/admin/subscriptions/user/{userId} - Get user subscription history
    getUserSubscriptionHistory: async (userId) => {
        const response = await apiClient.get(`/admin/subscriptions/user/${userId}`);
        return response.data;
    },

    // POST /api/admin/subscriptions/{id}/cancel - Cancel a subscription
    cancelSubscription: async (subscriptionId) => {
        const response = await apiClient.post(`/admin/subscriptions/${subscriptionId}/cancel`);
        return response.data;
    },
};

export default subscriptionsAPI;
