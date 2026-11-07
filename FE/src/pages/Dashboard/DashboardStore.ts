import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

interface DashboardStoreState {
    dashboardData: any | null;
    isLoading: boolean;
    error: string | null;

    getDashboardData: () => Promise<void>;
}

const useDashboardStore = create<DashboardStoreState>((set) => ({
    dashboardData: null,
    isLoading: false,
    error: null,

    getDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await RepositoryManager.dashboard.getDashboardData();
            if (result.success) {
                set({ dashboardData: result.data, isLoading: false });
            } else {
                throw new Error(result.message || "Failed to fetch dashboard data");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },
}));

export default useDashboardStore;
