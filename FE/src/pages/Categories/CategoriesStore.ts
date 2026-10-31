import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

export interface Category {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CategoriesStoreState {
  categories: Category[];
  pagination: CategoriesPagination;
  categoryDetail: Category | null;
  error: string | null;

  isListLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  getCategories: (params?: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  getCategoryById: (id: string | number) => Promise<{ success: boolean; data?: Category; error?: string }>;
  createCategory: (payload: Partial<Category>) => Promise<{ success: boolean; data?: Category; error?: string }>;
  updateCategory: (id: string | number, payload: Partial<Category>) => Promise<{ success: boolean; data?: Category; error?: string }>;
  deleteCategory: (id: string | number) => Promise<{ success: boolean; error?: string }>;
}

const useCategoriesStore = create<CategoriesStoreState>((set, get) => ({
  categories: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  categoryDetail: null,
  error: null,

  isListLoading: false,
  isDetailLoading: false,
  isSaving: false,
  isDeleting: false,

  getCategories: async (params = {}) => {
    set({ isListLoading: true, error: null });
    try {
      const res = await RepositoryManager.categories.getCategories(params);
      if (res?.success && res.data) {
        const items = res.data.data || [];
        set({
          categories: items,
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
      throw new Error(res?.message || "Không thể tải danh sách danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tải danh mục";
      set({ isListLoading: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  getCategoryById: async (id) => {
    set({ isDetailLoading: true, error: null });
    try {
      const res = await RepositoryManager.categories.getCategoryById(id);
      if (res?.success && res.data) {
        set({ categoryDetail: res.data, isDetailLoading: false });
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || "Không thể tải chi tiết danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tải chi tiết danh mục";
      set({ isDetailLoading: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  createCategory: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await RepositoryManager.categories.createCategory(payload);
      if (res?.success && res.data) {
        toast.success("Tạo danh mục mới thành công ✅");
        set({ isSaving: false });
        return { success: true, data: res.data };
      }
      throw new Error(res?.message || "Không thể tạo danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi tạo danh mục";
      set({ isSaving: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  updateCategory: async (id, payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await RepositoryManager.categories.updateCategory(id, payload);
      if (res?.success && res.data) {
        const updated = res.data as Category;
        set({
          categories: get().categories.map((c) => (c.id === updated.id ? updated : c)),
          categoryDetail: updated,
          isSaving: false,
        });
        toast.success("Cập nhật danh mục thành công ✅");
        return { success: true, data: updated };
      }
      throw new Error(res?.message || "Không thể cập nhật danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật danh mục";
      set({ isSaving: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },

  deleteCategory: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      const res = await RepositoryManager.categories.deleteCategory(id);
      if (res?.success) {
        set({
          categories: get().categories.filter((c) => c.id !== Number(id)),
          pagination: {
            ...get().pagination,
            total: Math.max(0, get().pagination.total - 1),
          },
          isDeleting: false,
        });
        toast.success("Đã xóa danh mục thành công 🗑");
        return { success: true };
      }
      throw new Error(res?.message || "Không thể xóa danh mục");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi xóa danh mục";
      set({ isDeleting: false, error: msg });
      toast.error(msg, { icon: "❌" });
      return { success: false, error: msg };
    }
  },
}));

export default useCategoriesStore;
