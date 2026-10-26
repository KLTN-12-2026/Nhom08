// Plan invites API module - stores guests' schedule responses so they reach the plan host automatically.
// These are public endpoints (no login): guests are anonymous, the host is identified by a secret host_token.
import apiClient from "../interceptor";

// `silentError` stops the global interceptor from showing error toasts: the UI falls back to a share link
const silent = { silentError: true };

const planInvitesAPI = {
    // POST /api/plan-invites - Host registers a shared plan (plan_id, host_token, plan)
    registerInvite: async (payload) => {
        const response = await apiClient.post("/plan-invites", payload, silent);
        return response.data;
    },

    // POST /api/plan-invites/{planId}/responses - Guest submits (or updates) a response
    submitResponse: async (planId, payload) => {
        const response = await apiClient.post(`/plan-invites/${encodeURIComponent(planId)}/responses`, payload, silent);
        return response.data;
    },

    // GET /api/plan-invites/{planId}/responses?host_token=... - Host reads all responses
    getResponses: async (planId, hostToken) => {
        const response = await apiClient.get(`/plan-invites/${encodeURIComponent(planId)}/responses`, {
            params: { host_token: hostToken },
            ...silent,
        });
        return response.data;
    },
};

export default planInvitesAPI;
