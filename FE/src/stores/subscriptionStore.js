import { create } from "zustand";
import { RepositoryManager } from "../data/repositoryManager";
import { message } from "antd";

/**
 * Subscription Store - Manages subscription data and operations
 * 
 * Features:
 * - List subscriptions with filters (status, platform, search)
 * - Pagination support (default: 30 items per page)
 * - View subscription details and user history
 * - Cancel subscriptions (DB only - requires manual RevenueCat cancellation)
 * - Dashboard statistics
 */
const useSubscriptionStore = create((set, get) => ({
    // State
    subscriptions: [],
    currentSubscription: null,
    userSubscriptionHistory: null,
    stats: null,

    // Loading states
    isLoading: false,
    isLoadingMore: false,
    isLoadingStats: false,
    isLoadingHistory: false,
    isCancelling: false,

    // Pagination
    pagination: {
        current_page: 1,
        per_page: 30,
        total: 0,
        last_page: 1,
    },

    // Filters
    filters: {
        status: null, // 'active', 'cancelled', 'expired'
        platform: null, // 'ios', 'android'
        search: "", // email, username, name
        sort_by: "created_at",
        sort_order: "desc",
    },

    /**
     * Fetch subscriptions with current filters and pagination
     */
    fetchSubscriptions: async (page = 1) => {
        const { filters, pagination } = get();

        try {
            set({ isLoading: page === 1, isLoadingMore: page > 1 });

            const params = {
                page,
                per_page: pagination.per_page,
                ...(filters.status && { status: filters.status }),
                ...(filters.platform && { platform: filters.platform }),
                ...(filters.search && { search: filters.search }),
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            };

            const response = await RepositoryManager.subscriptions.getSubscriptions(params);

            if (response.success) {
                set({
                    subscriptions: response.data.subscriptions,
                    pagination: response.data.pagination,
                });
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
            message.error(error.response?.data?.message || "Failed to load subscriptions");
        } finally {
            set({ isLoading: false, isLoadingMore: false });
        }
    },

    /**
     * Fetch dashboard statistics
     */
    fetchStats: async () => {
        try {
            set({ isLoadingStats: true });

            const response = await RepositoryManager.subscriptions.getStats();

            if (response.success) {
                set({ stats: response.data });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            message.error(error.response?.data?.message || "Failed to load statistics");
        } finally {
            set({ isLoadingStats: false });
        }
    },

    /**
     * Fetch subscription details by ID
     */
    fetchSubscriptionById: async (subscriptionId) => {
        try {
            set({ isLoading: true });

            const response = await RepositoryManager.subscriptions.getSubscriptionById(subscriptionId);

            if (response.success) {
                set({ currentSubscription: response.data });
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
            message.error(error.response?.data?.message || "Subscription not found");
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * Fetch user subscription history
     */
    fetchUserHistory: async (userId) => {
        try {
            set({ isLoadingHistory: true });

            const response = await RepositoryManager.subscriptions.getUserSubscriptionHistory(userId);

            if (response.success) {
                set({ userSubscriptionHistory: response.data });
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching user history:", error);
            message.error(error.response?.data?.message || "User not found");
            return null;
        } finally {
            set({ isLoadingHistory: false });
        }
    },

    /**
     * Cancel subscription (Database only)
     * Note: Admin must also cancel in RevenueCat dashboard
     */
    cancelSubscription: async (subscriptionId) => {
        try {
            set({ isCancelling: true });

            const response = await RepositoryManager.subscriptions.cancelSubscription(subscriptionId);

            if (response.success) {
                message.success("Subscription cancelled successfully");
                message.warning(response.note || "Please also cancel this subscription in RevenueCat dashboard", 5);

                // Refresh current list
                get().fetchSubscriptions(get().pagination.current_page);

                // Update current subscription if viewing details
                if (get().currentSubscription?.id === subscriptionId) {
                    set({ currentSubscription: response.data });
                }

                return response.data;
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            message.error(error.response?.data?.message || "Failed to cancel subscription");
            return null;
        } finally {
            set({ isCancelling: false });
        }
    },

    /**
     * Update filters and refresh data
     */
    setFilters: (newFilters) => {
        set({ filters: { ...get().filters, ...newFilters } });
        get().fetchSubscriptions(1); // Reset to page 1 when filters change
    },

    /**
     * Clear all filters
     */
    clearFilters: () => {
        set({
            filters: {
                status: null,
                platform: null,
                search: "",
                sort_by: "created_at",
                sort_order: "desc",
            },
        });
        get().fetchSubscriptions(1);
    },

    /**
     * Set page size
     */
    setPageSize: (pageSize) => {
        set({
            pagination: {
                ...get().pagination,
                per_page: pageSize,
            },
        });
        get().fetchSubscriptions(1);
    },

    /**
     * Reset store state
     */
    reset: () => {
        set({
            subscriptions: [],
            currentSubscription: null,
            userSubscriptionHistory: null,
            stats: null,
            isLoading: false,
            isLoadingMore: false,
            isLoadingStats: false,
            isLoadingHistory: false,
            isCancelling: false,
            pagination: {
                current_page: 1,
                per_page: 30,
                total: 0,
                last_page: 1,
            },
            filters: {
                status: null,
                platform: null,
                search: "",
                sort_by: "created_at",
                sort_order: "desc",
            },
        });
    },
}));

export default useSubscriptionStore;
