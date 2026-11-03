// Quotes Zustand store
import { create } from "zustand";
import RepositoryManager from "../../data/repositoryManager";

export interface Quote {
    id: number;
    content: string;
    type: string;
    language: string;
    priority: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface QuotesState {
    quotes: Quote[];
    loading: boolean;
    error?: string;
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    fetchQuotes: (params?: { per_page?: number; page?: number }) => Promise<void>;
    createQuote: (payload: Partial<Quote>) => Promise<void>;
    updateQuote: (id: number, payload: Partial<Quote>) => Promise<void>;
    deleteQuote: (id: number) => Promise<void>;
    toggleQuote: (id: number) => Promise<void>;
}

const useQuotesStore = create<QuotesState>((set, get) => ({
    quotes: [],
    loading: false,
    pagination: { total: 0, per_page: 20, current_page: 1, last_page: 1 },
    fetchQuotes: async (params = { per_page: 20, page: 1 }) => {
        set({ loading: true, error: undefined });
        try {
            const finalParams = { per_page: 20, page: 1, ...params };
            const res = await RepositoryManager.quotes.getQuotes(finalParams);
            
            // Handle different response formats
            if (res.success && res.data) {
                // Format: { success: true, data: { data: Quote[], ...pagination } }
                const quotesData = Array.isArray(res.data.data) ? res.data.data : res.data;
                const meta = res.data;
                
                set({
                    quotes: quotesData,
                    pagination: {
                        total: meta?.total || quotesData.length,
                        per_page: meta?.per_page || params.per_page || 20,
                        current_page: meta?.current_page || meta?.page || params.page || 1,
                        last_page: meta?.last_page || 1,
                    },
                    loading: false,
                });
            } else if (Array.isArray(res.data)) {
                // Format: { data: Quote[] }
                set({
                    quotes: res.data,
                    pagination: {
                        total: res.data.length,
                        per_page: params.per_page || 20,
                        current_page: params.page || 1,
                        last_page: 1,
                    },
                    loading: false,
                });
            } else {
                set({ error: "Unexpected response format", loading: false });
            }
        } catch (e: any) {
            set({ error: e.message || "Failed to fetch quotes", loading: false });
        }
    },
    createQuote: async (payload) => {
        set({ loading: true, error: undefined });
        try {
            const res = await RepositoryManager.quotes.createQuote(payload);
            if (res.success || res.data) {
                // refresh list
                await get().fetchQuotes({ per_page: get().pagination.per_page, page: get().pagination.current_page });
            } else {
                throw new Error(res.message || "Failed to create quote");
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Failed to create quote";
            set({ error: msg });
            throw new Error(msg);
        } finally {
            set({ loading: false });
        }
    },
    updateQuote: async (id, payload) => {
        set({ loading: true, error: undefined });
        try {
            const res = await RepositoryManager.quotes.updateQuote(id, payload);
            if (res.success || res.data) {
                await get().fetchQuotes({ per_page: get().pagination.per_page, page: get().pagination.current_page });
            } else {
                throw new Error(res.message || "Failed to update quote");
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Failed to update quote";
            set({ error: msg });
            throw new Error(msg);
        } finally {
            set({ loading: false });
        }
    },
    deleteQuote: async (id) => {
        set({ loading: true, error: undefined });
        try {
            const res = await RepositoryManager.quotes.deleteQuote(id);
            if (res.success !== false) {
                await get().fetchQuotes({ per_page: get().pagination.per_page, page: get().pagination.current_page });
            } else {
                throw new Error(res.message || "Failed to delete quote");
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Failed to delete quote";
            set({ error: msg });
            throw new Error(msg);
        } finally {
            set({ loading: false });
        }
    },
    toggleQuote: async (id) => {
        set({ loading: true, error: undefined });
        try {
            const res = await RepositoryManager.quotes.toggleQuote(id);
            if (res.success || res.data) {
                await get().fetchQuotes({ per_page: get().pagination.per_page, page: get().pagination.current_page });
            } else {
                throw new Error(res.message || "Failed to toggle quote");
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Failed to toggle quote";
            set({ error: msg });
            throw new Error(msg);
        } finally {
            set({ loading: false });
        }
    },
}));

export default useQuotesStore;
