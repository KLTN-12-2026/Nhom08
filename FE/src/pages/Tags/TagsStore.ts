import { create } from "zustand";
import { RepositoryManager } from "../../data/repositoryManager";

export interface Tag {
    id: number;
    name: string;
    display: boolean;
    created_at?: string;
    updated_at?: string;
    display_name?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    usage_count?: number;
    is_active?: boolean;
}

interface TagsDataResponse {
    current_page: number;
    data: Tag[];
    per_page: number;
    total: number;
    last_page?: number;
}

interface TagsStoreState {
    tagsData: TagsDataResponse | null;
    tagData: { data: Tag } | null;
    error: string | null;

    isListLoading: boolean;
    isDetailLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;

    getTags: (params?: any) => Promise<{ success: boolean; data?: TagsDataResponse; error?: string }>;
    getTagById: (tagId: string | number) => Promise<{ success: boolean; data?: { data: Tag }; error?: string }>;
    createTag: (payload: Partial<Tag>) => Promise<{ success: boolean; data?: Tag; error?: string }>;
    updateTag: (tagId: string | number, payload: Partial<Tag>) => Promise<{ success: boolean; data?: Tag; error?: string }>;
    deleteTag: (tagId: string | number) => Promise<{ success: boolean; error?: string }>;
}

const useTagsStore = create<TagsStoreState>((set, get) => ({
    tagsData: null,
    tagData: null,
    error: null,

    isListLoading: false,
    isDetailLoading: false,
    isSaving: false,
    isDeleting: false,

    getTags: async (params = {}) => {
        set({ isListLoading: true, error: null });
        try {
            // Map search parameter to query for BE SearchFilterRequest
            const apiParams: any = { ...params };
            if (params.search && !params.query) {
                apiParams.query = params.search;
            }
            const result = await RepositoryManager.tags.getTags(apiParams);
            if (result && (result.success || result.data)) {
                const resData = result.data || result;
                const rawList: Tag[] = Array.isArray(resData) ? resData : (resData.data || []);
                const transformedData: TagsDataResponse = {
                    current_page: resData.current_page || 1,
                    data: rawList.map((tag: Tag) => ({
                        ...tag,
                        display_name: tag.display_name || (tag.name ? tag.name.charAt(0).toUpperCase() + tag.name.slice(1) : ""),
                        is_active: tag.display !== undefined ? Boolean(tag.display) : (tag.is_active ?? true),
                        usage_count: tag.usage_count || 0,
                    })),
                    per_page: resData.per_page || 10,
                    total: resData.total || (Array.isArray(resData) ? resData.length : (resData.data?.length || 0)),
                    last_page: resData.last_page || 1,
                };
                set({ tagsData: transformedData, isListLoading: false });
                return { success: true, data: transformedData };
            }
            throw new Error(result?.message || "Không thể tải danh sách thẻ");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi tải danh sách thẻ";
            set({ isListLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    getTagById: async (tagId) => {
        set({ isDetailLoading: true, error: null });
        try {
            const result = await RepositoryManager.tags.getTagById(tagId);
            if (result && (result.success || result.data)) {
                const item = (result.data?.data || result.data || result) as Tag;
                const fullItem: Tag = {
                    ...item,
                    display_name: item.display_name || (item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ""),
                    is_active: item.display !== undefined ? Boolean(item.display) : (item.is_active ?? true),
                };
                set({ tagData: { data: fullItem }, isDetailLoading: false });
                return { success: true, data: { data: fullItem } };
            }
            throw new Error(result?.message || "Không thể tải chi tiết thẻ");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi tải chi tiết thẻ";
            set({ isDetailLoading: false, error: msg });
            return { success: false, error: msg };
        }
    },

    createTag: async (payload) => {
        set({ isSaving: true, error: null });
        try {
            const apiPayload = {
                name: payload.name,
                display: payload.display !== undefined ? payload.display : (payload.is_active !== undefined ? payload.is_active : true),
            };
            const result = await RepositoryManager.tags.createTag(apiPayload);
            if (result && (result.success || result.data)) {
                const newTag = (result.data?.data || result.data || result) as Tag;
                const fullTag: Tag = {
                    ...newTag,
                    display_name: newTag.name.charAt(0).toUpperCase() + newTag.name.slice(1),
                    is_active: Boolean(newTag.display),
                    usage_count: 0,
                };
                const { tagsData } = get();
                if (tagsData) {
                    set({
                        tagsData: {
                            ...tagsData,
                            data: [fullTag, ...tagsData.data],
                            total: tagsData.total + 1,
                        },
                    });
                }
                set({ isSaving: false });
                return { success: true, data: fullTag };
            }
            throw new Error(result?.message || "Không thể tạo thẻ");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi tạo thẻ";
            set({ isSaving: false, error: msg });
            return { success: false, error: msg };
        }
    },

    updateTag: async (tagId, payload) => {
        set({ isSaving: true, error: null });
        try {
            const apiPayload: any = {};
            if (payload.name !== undefined) apiPayload.name = payload.name;
            if (payload.display !== undefined) {
                apiPayload.display = payload.display;
            } else if (payload.is_active !== undefined) {
                apiPayload.display = payload.is_active;
            }

            const result = await RepositoryManager.tags.updateTag(tagId, apiPayload);
            if (result && (result.success || result.data)) {
                const updatedTag = (result.data?.data || result.data || result) as Tag;
                const fullTag: Tag = {
                    ...updatedTag,
                    display_name: updatedTag.name.charAt(0).toUpperCase() + updatedTag.name.slice(1),
                    is_active: Boolean(updatedTag.display),
                };
                const { tagsData } = get();
                if (tagsData) {
                    set({
                        tagsData: {
                            ...tagsData,
                            data: tagsData.data.map((t) => (t.id === Number(tagId) ? { ...t, ...fullTag } : t)),
                        },
                    });
                }
                set({ isSaving: false });
                return { success: true, data: fullTag };
            }
            throw new Error(result?.message || "Không thể cập nhật thẻ");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật thẻ";
            set({ isSaving: false, error: msg });
            return { success: false, error: msg };
        }
    },

    deleteTag: async (tagId) => {
        set({ isDeleting: true, error: null });
        try {
            const result = await RepositoryManager.tags.deleteTag(tagId);
            if (result && result.success !== false) {
                const { tagsData } = get();
                if (tagsData) {
                    set({
                        tagsData: {
                            ...tagsData,
                            data: tagsData.data.filter((t) => t.id !== Number(tagId)),
                            total: Math.max(0, tagsData.total - 1),
                        },
                    });
                }
                set({ isDeleting: false });
                return { success: true };
            }
            throw new Error(result?.message || "Không thể xóa thẻ");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Lỗi xóa thẻ";
            set({ isDeleting: false, error: msg });
            return { success: false, error: msg };
        }
    },
}));

export default useTagsStore;

