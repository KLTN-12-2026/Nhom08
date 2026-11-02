import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

export interface Category {
  id: number;
  name: string;
  display_name: string;
  subtype_name?: string | null;
  display_order?: number;
}

export interface ActivityGroup {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category[];
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ActivityGroupsStoreState {
  groups: ActivityGroup[];
  pagination: Pagination;
  groupDetail: ActivityGroup | null;
  error: string | null;

  isListLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  getGroups: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  getGroupById: (id: string | number) => Promise<{ success: boolean; data?: ActivityGroup; error?: string }>;
  createGroup: (payload: any) => Promise<{ success: boolean; data?: ActivityGroup; error?: string }>;
  updateGroup: (id: string | number, payload: any) => Promise<{ success: boolean; data?: ActivityGroup; error?: string }>;
  deleteGroup: (id: string | number) => Promise<{ success: boolean; error?: string }>;
  syncCategories: (id: string | number, categories: any[]) => Promise<{ success: boolean; data?: ActivityGroup; error?: string }>;
}

const useActivityGroupsStore = create<ActivityGroupsStoreState>((set, get) => ({
  groups: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  groupDetail: null,
  error: null,

  isListLoading: false,
  isDetailLoading: false,
  isSaving: false,
  isDeleting: false,

  getGroups: async (params = {}) => {
    set({ isListLoading: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.getGroups(params);
      if (res?.success && res.data) {
        const items = res.data.data || [];
        set({
          groups: items,
          pagination: {
            current_page: res.data.current_page || 1,
            last_page: res.data.last_page || 1,
            per_page: res.data.per_page || 10,
            total: res.data.total ?? items.length,
          },
          isListLoading: false,
        });
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || "Không thể tải danh sách nhóm hoạt động");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tải nhóm hoạt động";
      set({ isListLoading: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  getGroupById: async (id) => {
    set({ isDetailLoading: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.getGroupById(id);
      if (res?.success && res.data) {
        set({ groupDetail: res.data, isDetailLoading: false });
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || "Không thể tải chi tiết nhóm hoạt động");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tải chi tiết nhóm hoạt động";
      set({ isDetailLoading: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  createGroup: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.createGroup(payload);
      if (res?.success && res.data) {
        toast.success("Tạo nhóm hoạt động thành công ✅");
        set({ isSaving: false });
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || "Không thể tạo nhóm hoạt động");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tạo nhóm hoạt động";
      set({ isSaving: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  updateGroup: async (id, payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.updateGroup(id, payload);
      if (res?.success && res.data) {
        const updated = res.data as ActivityGroup;
        set({
          groups: get().groups.map((g) => (g.id === updated.id ? updated : g)),
          groupDetail: updated,
          isSaving: false,
        });
        toast.success("Cập nhật nhóm hoạt động thành công ✅");
        return { success: true, data: updated };
      }
      throw new Error(res?.message || "Không thể cập nhật nhóm hoạt động");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật nhóm hoạt động";
      set({ isSaving: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  deleteGroup: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.deleteGroup(id);
      if (res?.success) {
        set({
          groups: get().groups.filter((g) => g.id !== Number(id)),
          pagination: {
            ...get().pagination,
            total: Math.max(0, get().pagination.total - 1),
          },
          isDeleting: false,
        });
        toast.success("Đã xóa nhóm hoạt động thành công 🗑");
        return { success: true };
      }
      throw new Error(res?.message || "Không thể xóa nhóm hoạt động");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi xóa nhóm hoạt động";
      set({ isDeleting: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  syncCategories: async (id, categories) => {
    set({ isSaving: true, error: null });
    try {
      const res = await RepositoryManager.activityGroups.syncCategories(id, categories);
      if (res?.success && res.data) {
        const updated = res.data as ActivityGroup;
        set({
          groups: get().groups.map((g) => (g.id === updated.id ? updated : g)),
          groupDetail: updated,
          isSaving: false,
        });
        toast.success("Đồng bộ danh mục thành công ✅");
        return { success: true, data: updated };
      }
      throw new Error(res?.message || "Không thể đồng bộ danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi đồng bộ danh mục";
      set({ isSaving: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },
}));

export default useActivityGroupsStore;
