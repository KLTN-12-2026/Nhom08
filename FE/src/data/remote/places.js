// Places API module
import apiClient from "../interceptor";

const placesAPI = {
    // GET /api/admin/places - Get all places with pagination and filters (admin)
    getPlaces: async (params = {}) => {
        const response = await apiClient.get("/admin/places", { params });
        return response.data;
    },

    // GET /api/places - Public places list for main screen (no /admin prefix)
    getPublicPlaces: async (params = {}) => {
        const response = await apiClient.get("/places", { params });
        return response.data;
    },

    // GET /api/places/my-places - Get user's own contributed places (pending/published)
    getMyPlaces: async (params = {}) => {
        const response = await apiClient.get("/places/my-places", { params });
        return response.data;
    },

    // POST /api/places - Public create new place (non-admin)
    createPublicPlace: async (placeData) => {
        const response = await apiClient.post("/places", placeData);
        return response.data;
    },

    // POST /api/admin/places - Create new place
    createPlace: async (placeData) => {
        const response = await apiClient.post("/admin/places", placeData);
        return response.data;
    },

    // GET /api/admin/places/{place} - Get place details
    getPlaceById: async (placeId) => {
        const response = await apiClient.get(`/places/${placeId}`);
        return response.data;
    },

    // PUT /api/admin/places/{place} - Update place
    updatePlace: async (placeId, placeData) => {
        if (placeData instanceof FormData) {
            placeData.append('_method', 'PUT');
            const response = await apiClient.post(`/admin/places/${placeId}`, placeData);
            return response.data;
        }
        const response = await apiClient.put(`/admin/places/${placeId}`, placeData);
        return response.data;
    },

    // DELETE /api/places/{place} - Delete place (customer)
    deletePublicPlace: async (placeId) => {
        const response = await apiClient.delete(`/places/${placeId}`);
        return response.data;
    },

    // DELETE /api/admin/places/{place} - Delete place (admin)
    deletePlace: async (placeId) => {
        const response = await apiClient.delete(`/admin/places/${placeId}`);
        return response.data;
    },

    // POST /api/admin/places/{place}/approve - Approve a single place
    approvePlace: async (placeId) => {
        const response = await apiClient.post(`/admin/places/${placeId}/approve`);
        return response.data;
    },

    // POST /api/admin/places/{place}/reject - Reject a single place
    rejectPlace: async (placeId) => {
        const response = await apiClient.post(`/admin/places/${placeId}/reject`);
        return response.data;
    },

    // POST /api/admin/places/approve-all - Approve multiple places (by IDs or filter object)
    approveAll: async (payload) => {
        const response = await apiClient.post(`/admin/places/approve-all`, payload);
        return response.data;
    },

    // POST /api/admin/places/reject-all - Reject multiple places (by IDs or filter object)
    rejectAll: async (payload) => {
        const response = await apiClient.post(`/admin/places/reject-all`, payload);
        return response.data;
    },

    // POST /api/reviews - Create a new review/comment
    createReview: async (payload) => {
        const response = await apiClient.post(`/reviews`, payload);
        return response.data;
    },

    // POST /api/favorite-places/toggle - Toggle favorite place
    toggleFavorite: async (placeId) => {
        const response = await apiClient.post(`/favorite-places/toggle`, { place_id: placeId });
        return response.data;
    },

    // GET /api/favorite-places - Get user's favorite places
    getFavoritePlaces: async () => {
        const response = await apiClient.get("/favorite-places");
        return response.data;
    },

    // GET /api/places/movie - Fetch live movies parsed from Moveek
    getLiveMovies: async () => {
        const response = await apiClient.get("/places/movie");
        return response.data;
    },
};

export default placesAPI;
