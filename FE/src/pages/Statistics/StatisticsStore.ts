import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

interface StatisticsStoreState {
    usersStats: any | null;
    placesStats: any | null;
    transactionsStats: any | null;
    generalStats: any | null;
    isLoading: boolean;
    error: string | null;

    getUsersStats: (params?: any) => Promise<void>;
    getPlacesStats: (params?: any) => Promise<void>;
    getTransactionsStats: (params?: any) => Promise<void>;
    getGeneralStats: () => Promise<void>;
}

const useStatisticsStore = create<StatisticsStoreState>((set) => ({
    usersStats: null,
    placesStats: null,
    transactionsStats: null,
    generalStats: null,
    isLoading: false,
    error: null,

    getUsersStats: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const result = await RepositoryManager.statistics.getUsersStats(params);
            if (result.success) {
                set({ usersStats: result.data, isLoading: false });
            } else {
                throw new Error(result.message || "Failed to fetch users statistics");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },

    getPlacesStats: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const result = await RepositoryManager.statistics.getPlacesStats(params);
            if (result.success) {
                set({ placesStats: result.data, isLoading: false });
            } else {
                throw new Error(result.message || "Failed to fetch places statistics");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },

    getTransactionsStats: async (params?: any) => {
        set({ isLoading: true, error: null });
        try {
            const result = await RepositoryManager.statistics.getTransactionsStats(params);
            if (result.success) {
                set({ transactionsStats: result.data, isLoading: false });
            } else {
                throw new Error(result.message || "Failed to fetch transactions statistics");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },

    getGeneralStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await RepositoryManager.statistics.getGeneralStats();
            if (result.success) {
                set({ generalStats: result.data, isLoading: false });
            } else {
                throw new Error(result.message || "Failed to fetch general statistics");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },
}));

export default useStatisticsStore;
