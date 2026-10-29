import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

interface Wallet {
  id: number;
  user_id?: number;
  points: number;
  level: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  places_count: number;
  reviews_count: number;
  posts_count: number;
  friends_count: number;
}

interface Statistics {
  id: number;
  user_id: number;
  total_trips: number;
  completed_trips: number;
  canceled_trips: number;
  accepted_trips: number;
  created_at: string;
  updated_at: string;
}

interface Trip {
  id: number;
  user_id: number;
  vehicle_id: number | null;
  pickup_name: string | null;
  pickup_latitude: string | null;
  pickup_longitude: string | null;
  pickup_province_code: string;
  pickup_ward_code: string;
  pickup_path: string;
  pickup_path_with_type: string;
  dropoff_name: string | null;
  dropoff_latitude: string | null;
  dropoff_longitude: string | null;
  dropoff_province_code: string;
  dropoff_ward_code: string;
  dropoff_path: string;
  dropoff_path_with_type: string;
  available_seats: number;
  pickup_time: string;
  contact_phone: string;
  point: number;
  price: string;
  status: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string | null;
  role: string;
  gender: string;
  is_active: boolean;
  is_blocked: boolean;
  avatar: string | null;
  activity_area?: string[];
  is_block?: number; // Legacy field for compatibility
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  wallet: Wallet;
  stats: Stats;
  statistics?: Statistics; // Legacy field for compatibility
  vehicles?: any[];
  trips?: Trip[];
}

interface PaginationLinks {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface UsersDataResponse {
  current_page: number;
  data: User[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface UserDataResponse {
  data: User;
}

interface UsersStoreState {
  usersData: UsersDataResponse | null;
  userData: UserDataResponse | null;
  error: string | null;

  isListLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isTogglingBlock: boolean;

  getListUser: (params?: any) => Promise<{ success: boolean; data?: UsersDataResponse; error?: string }>;
  getUser: (userId: string | number) => Promise<{ success: boolean; data?: UserDataResponse; error?: string }>;
  createUser: (payload: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  updateUser: (userId: string | number, payload: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  deleteUser: (userId: string | number) => Promise<{ success: boolean; error?: string }>;
  toggleBlockUser: (userId: string | number, isBlock: boolean) => Promise<{ success: boolean; error?: string }>;
  bulkDeleteUsers: (userIds: (string | number)[]) => Promise<{ success: boolean; error?: string }>;
}

const normalizeUser = (u: any): User => {
  if (!u) return u;
  return {
    ...u,
    phone_number: u.phone_number ?? u.phone ?? null,
  };
};

const useUsersStore = create<UsersStoreState>((set, get) => ({
  usersData: null,
  userData: null,
  error: null,

  isListLoading: false,
  isDetailLoading: false,
  isSaving: false,
  isDeleting: false,
  isTogglingBlock: false,

  getListUser: async (params = {}) => {
    set({ isListLoading: true, error: null });
    try {
      const result = await RepositoryManager.users.getUsers(params);
      if (result.success && result.data) {
        // Support both shapes:
        // A) { users: [...], pagination: {...} }
        // B) { data: [...], current_page, last_page, per_page, total, ... }
        let usersArray: User[] = [];
        let pagination = {
          current_page: 1,
          data: [] as User[],
          first_page_url: "",
          from: 0,
          last_page: 1,
          last_page_url: "",
          links: [],
          next_page_url: null,
          path: "",
          per_page: 10,
          prev_page_url: null,
          to: 0,
          total: 0,
        };

        if (Array.isArray(result.data.users) && result.data.pagination) {
          usersArray = result.data.users;
          const p = result.data.pagination;
          pagination = {
            ...pagination,
            current_page: p.current_page,
            data: usersArray,
            from: p.from,
            last_page: p.last_page,
            per_page: p.per_page,
            to: p.to,
            total: p.total,
          };
        } else if (Array.isArray(result.data.data)) {
          usersArray = result.data.data;
          pagination = {
            ...pagination,
            current_page: result.data.current_page || 1,
            data: usersArray,
            from: result.data.from || 0,
            last_page: result.data.last_page || 1,
            per_page: result.data.per_page || params.per_page || 30,
            to: result.data.to || usersArray.length,
            total: result.data.total || usersArray.length,
          };
        } else {
          throw new Error("Unexpected users response format");
        }

        pagination.data = pagination.data.map(normalizeUser);

        set({ usersData: pagination, isListLoading: false });
        return { success: true, data: pagination };
      }
      throw new Error(result.message || "Không thể tải danh sách người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      set({ isListLoading: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  getUser: async (userId) => {
    set({ isDetailLoading: true, error: null });
    try {
      const result = await RepositoryManager.users.getUserById(userId);
      if (result.success && result.data) {
        // Support both shapes: data.user or data (user object)
        const user = normalizeUser((result.data as any).user ?? result.data);
        set({ userData: { data: user }, isDetailLoading: false });
        return { success: true, data: { data: user } };
      }
      throw new Error(result.message || "Không thể tải người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      set({ isDetailLoading: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  createUser: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const apiPayload = {
        ...payload,
        phone: payload.phone_number ?? (payload as any).phone
      };
      const result = await RepositoryManager.users.createUser(apiPayload);
      if (result.success && result.data) {
        const newUser = normalizeUser(result.data as User);
        const { usersData } = get();
        if (usersData) {
          const newData = {
            ...usersData,
            data: [newUser, ...usersData.data],
            total: usersData.total + 1,
          };
          set({ usersData: newData });
        }
        toast.success("Tạo người dùng thành công ✅");
        set({ isSaving: false });
        return { success: true, data: newUser };
      }
      throw new Error(result.message || "Không thể tạo người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi tạo người dùng";
      set({ isSaving: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  updateUser: async (userId, payload) => {
    set({ isSaving: true, error: null });
    try {
      const apiPayload = {
        ...payload,
        phone: payload.phone_number ?? (payload as any).phone
      };
      const result = await RepositoryManager.users.updateUser(userId, apiPayload);
      if (result.success && result.data) {
        const updatedUser = normalizeUser(result.data as User);
        const { usersData } = get();
        if (usersData) {
          const newData = {
            ...usersData,
            data: usersData.data.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          };
          set({ usersData: newData });
        }
        toast.success("Cập nhật người dùng thành công ✅");
        set({ isSaving: false });
        return { success: true, data: updatedUser };
      }
      throw new Error(result.message || "Không thể cập nhật người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      set({ isSaving: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  deleteUser: async (userId) => {
    set({ isDeleting: true, error: null });
    try {
      const result = await RepositoryManager.users.deleteUser(userId);
      if (result.success) {
        const { usersData } = get();
        if (usersData) {
          set({
            usersData: {
              ...usersData,
              data: usersData.data.filter((u) => u.id !== userId),
              total: usersData.total - 1,
            },
          });
        }
        toast.success("Đã xóa người dùng 🗑");
        set({ isDeleting: false });
        return { success: true };
      }
      throw new Error(result.message || "Không thể xóa người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi xóa người dùng";
      set({ isDeleting: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  toggleBlockUser: async (userId, isBlock) => {
    set({ isTogglingBlock: true, error: null });
    try {
      const result = await RepositoryManager.users.toggleBlockUser(userId, isBlock);
      if (result.success) {
        const { usersData } = get();
        if (usersData) {
          const newData = {
            ...usersData,
            data: usersData.data.map((u) =>
              u.id === userId ? { ...u, is_block: isBlock ? 1 : 0, is_blocked: isBlock } : u
            ),
          };
          set({ usersData: newData });
        }
        toast.success(isBlock ? "Đã chặn người dùng 🚫" : "Đã mở chặn người dùng ✅");
        set({ isTogglingBlock: false });
        return { success: true };
      }
      throw new Error("Không thể thay đổi trạng thái người dùng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi chặn/mở chặn";
      set({ isTogglingBlock: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },

  bulkDeleteUsers: async (userIds) => {
    set({ isDeleting: true, error: null });
    try {
      // Since there is no bulk delete API, we delete one by one
      // We accept that some might fail, but we want to process as many as possible.
      // Or we can use Promise.all to do it in parallel.
      const deletePromises = userIds.map(id => RepositoryManager.users.deleteUser(id));

      const results = await Promise.allSettled(deletePromises);

      const successfulIds = new Set<string | number>();
      let failedCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulIds.add(userIds[index]);
        } else {
          failedCount++;
        }
      });

      if (successfulIds.size > 0) {
        const { usersData } = get();
        if (usersData) {
          set({
            usersData: {
              ...usersData,
              data: usersData.data.filter((u) => !successfulIds.has(u.id)),
              total: usersData.total - successfulIds.size,
            },
          });
        }
      }

      set({ isDeleting: false });

      if (failedCount === 0) {
        toast.success(`Đã xóa ${successfulIds.size} người dùng thành công 🗑`);
        return { success: true };
      } else {
        const msg = `Đã xóa ${successfulIds.size} người dùng. Lỗi ${failedCount} người dùng.`;
        toast.error(msg);
        return { success: successfulIds.size > 0, error: msg };
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi xóa nhiều người dùng";
      set({ isDeleting: false, error: message });
      toast.error(message, { icon: "❌" });
      return { success: false, error: message };
    }
  },
}));

export default useUsersStore;