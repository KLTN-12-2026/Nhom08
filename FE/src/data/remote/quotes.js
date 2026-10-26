// Quotes API module
import apiClient from "../interceptor";

/**
 * Get list of quotes with pagination
 */
export const getQuotes = async (params = { per_page: 20, page: 1 }) => {
    const response = await apiClient.get("/admin/quotes", { params });
    return response.data;
};

/**
 * Create a new quote
 */
export const createQuote = async (payload) => {
    const response = await apiClient.post("/admin/quotes", payload);
    return response.data;
};

/**
 * Get a single quote by ID
 */
export const getQuoteById = async (id) => {
    const response = await apiClient.get(`/admin/quotes/${id}`);
    return response.data;
};

/**
 * Update a quote
 */
export const updateQuote = async (id, payload) => {
    const response = await apiClient.put(`/admin/quotes/${id}`, payload);
    return response.data;
};

/**
 * Soft delete a quote
 */
export const deleteQuote = async (id) => {
    const response = await apiClient.delete(`/admin/quotes/${id}`);
    return response.data;
};

/**
 * Toggle active status of a quote
 */
export const toggleQuote = async (id) => {
    const response = await apiClient.post(`/admin/quotes/${id}/toggle`);
    return response.data;
};
