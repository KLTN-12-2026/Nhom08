import { create } from "zustand";
import { message } from "antd";
import { RepositoryManager } from "../../data/repositoryManager";

export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: "banner" | "popup" | "text" | string;
    position: "home" | string;
    status: "active" | "inactive" | string;
    priority: number;
    start_at: string | null;
    end_at: string | null;
    created_at?: string;
    updated_at?: string;
}

interface AnnouncementsDataResponse {
    current_page: number;
    data: Announcement[];
    per_page: number;
    total: number;
    last_page?: number;
}

interface AnnouncementsStoreState {
    announcementsData: AnnouncementsDataResponse | null;
    announcementData: { data: Announcement } | null;
    error: string | null;

    isListLoading: boolean;
    isDetailLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;

    getAnnouncements: (params?: any) => Promise<{ success: boolean; data?: AnnouncementsDataResponse; error?: string }>;
    getAnnouncementById: (announcementId: string | number) => Promise<{ success: boolean; data?: { data: Announcement }; error?: string }>;
    createAnnouncement: (payload: Partial<Announcement>) => Promise<{ success: boolean; data?: Announcement; error?: string }>;
    updateAnnouncement: (announcementId: string | number, payload: Partial<Announcement>) => Promise<{ success: boolean; data?: Announcement; error?: string }>;
    deleteAnnouncement: (announcementId: string | number) => Promise<{ success: boolean; error?: string }>;
}

const useAnnouncementsStore = create<AnnouncementsStoreState>((set, get) => ({
    announcementsData: null,
    announcementData: null,
    error: null,

    isListLoading: false,
    isDetailLoading: false,
    isSaving: false,
    isDeleting: false,

    getAnnouncements: async (params = {}) => {
        set({ isListLoading: true, error: null });
        try {
            const result = await RepositoryManager.announcements.getAnnouncements(params);
            if (result && (result.success || result.data)) {
                const resData = result.data || result;
                const transformedData: AnnouncementsDataResponse = {
                    current_page: resData.current_page || 1,
                    data: Array.isArray(resData) ? resData : (resData.data || []),
                    per_page: resData.per_page || 10,
                    total: resData.total || (Array.isArray(resData) ? resData.length : (resData.data?.length || 0)),
                    last_page: resData.last_page || 1,
                };
                set({ announcementsData: transformedData, isListLoading: false });
                return { success: true, data: transformedData };
            }
            throw new Error(result?.message || "Không thể tải danh sách thông báo");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi tải thông báo";
            set({ isListLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    getAnnouncementById: async (announcementId) => {
        set({ isDetailLoading: true, error: null });
        try {
            const result = await RepositoryManager.announcements.getAnnouncementById(announcementId);
            if (result && (result.success || result.data)) {
                const item = result.data?.data || result.data || result;
                set({ announcementData: { data: item }, isDetailLoading: false });
                return { success: true, data: { data: item } };
            }
            throw new Error(result?.message || "Không thể lấy chi tiết thông báo");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi lấy chi tiết";
            set({ isDetailLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    createAnnouncement: async (payload) => {
        set({ isSaving: true, error: null });
        try {
            const result = await RepositoryManager.announcements.createAnnouncement(payload);
            if (result && (result.success || result.data)) {
                const newAnnouncement = (result.data?.data || result.data || result) as Announcement;
                const { announcementsData } = get();
                if (announcementsData) {
                    set({
                        announcementsData: {
                            ...announcementsData,
                            data: [newAnnouncement, ...announcementsData.data],
                            total: announcementsData.total + 1,
                        },
                    });
                }
                set({ isSaving: false });
                return { success: true, data: newAnnouncement };
            }
            throw new Error(result?.message || "Không thể tạo thông báo");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi tạo thông báo";
            set({ isSaving: false, error: msg });
            return { success: false, error: msg };
        }
    },

    updateAnnouncement: async (announcementId, payload) => {
        set({ isSaving: true, error: null });
        try {
            const result = await RepositoryManager.announcements.updateAnnouncement(announcementId, payload);
            if (result && (result.success || result.data)) {
                const updatedAnnouncement = (result.data?.data || result.data || result) as Announcement;
                const { announcementsData } = get();
                if (announcementsData) {
                    set({
                        announcementsData: {
                            ...announcementsData,
                            data: announcementsData.data.map((a) => (a.id === updatedAnnouncement.id ? updatedAnnouncement : a)),
                        },
                    });
                }
                set({ isSaving: false });
                return { success: true, data: updatedAnnouncement };
            }
            throw new Error(result?.message || "Không thể cập nhật thông báo");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật thông báo";
            set({ isSaving: false, error: msg });
            return { success: false, error: msg };
        }
    },

    deleteAnnouncement: async (announcementId) => {
        set({ isDeleting: true, error: null });
        try {
            const result = await RepositoryManager.announcements.deleteAnnouncement(announcementId);
            if (result && (result.success !== false)) {
                const { announcementsData } = get();
                if (announcementsData) {
                    set({
                        announcementsData: {
                            ...announcementsData,
                            data: announcementsData.data.filter((a) => a.id !== announcementId),
                            total: Math.max(0, announcementsData.total - 1),
                        },
                    });
                }
                set({ isDeleting: false });
                return { success: true };
            }
            throw new Error(result?.message || "Không thể xóa thông báo");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi xóa thông báo";
            set({ isDeleting: false, error: msg });
            return { success: false, error: msg };
        }
    },
}));

export default useAnnouncementsStore;

