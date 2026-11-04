import { create } from "zustand";
import { RepositoryManager } from "../../data/repositoryManager";
import { message } from "antd";

export interface Notification {
  id: number;
  title: string;
  message?: string;
  content?: string;
  type?: string;
  user_id?: number | null;
  user?: { id: number; name: string; email: string } | null;
  is_broadcast?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  phone_number?: string;
  role?: string;
  is_active?: boolean;
  is_blocked?: boolean;
}

interface NotificationsState {
  notificationsData: any | null;
  notificationDetail: Notification | null;
  isListLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;

  // Users state for selection
  usersList: User[];
  isLoadingUsers: boolean;

  getNotifications: (params?: any) => Promise<any>;
  getNotificationById: (id: number) => Promise<any>;
  sendToUser: (payload: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    data?: any;
    push?: boolean;
  }) => Promise<any>;
  sendToUsers: (payload: {
    user_ids: number[];
    title: string;
    message: string;
    type?: string;
    data?: any;
    push?: boolean;
  }) => Promise<any>;
  broadcast: (payload: {
    title: string;
    message: string;
    type?: string;
    data?: any;
    push?: boolean;
  }) => Promise<any>;
  deleteNotification: (id: number) => Promise<any>;
  loadUsers: (search?: string) => Promise<void>;
  clearUsersList: () => void;
}

const useNotificationsStore = create<NotificationsState>((set) => ({
  notificationsData: null,
  notificationDetail: null,
  isListLoading: false,
  isDetailLoading: false,
  isSaving: false,
  usersList: [],
  isLoadingUsers: false,

  async getNotifications(params = {}) {
    set({ isListLoading: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.getNotifications(params);
      if (res && (res.success || res.data)) {
        set({ notificationsData: res.data || res });
      }
      return res;
    } catch (error) {
      console.error("Error loading notifications:", error);
      return { success: false, error };
    } finally {
      set({ isListLoading: false });
    }
  },

  async getNotificationById(id) {
    set({ isDetailLoading: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.getDetail(id);
      if (res && (res.success || res.data)) {
        set({ notificationDetail: res.data || res });
      }
      return res;
    } catch (error) {
      console.error("Error getting notification detail:", error);
      return { success: false, error };
    } finally {
      set({ isDetailLoading: false });
    }
  },

  async sendToUser(payload) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.sendToUser(payload);
      return res;
    } catch (error: any) {
      console.error("Error sending to user:", error);
      return { success: false, message: error?.response?.data?.message || "Lỗi khi gửi thông báo" };
    } finally {
      set({ isSaving: false });
    }
  },

  async sendToUsers(payload) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.sendToUsers(payload);
      return res;
    } catch (error: any) {
      console.error("Error sending to users:", error);
      return { success: false, message: error?.response?.data?.message || "Lỗi khi gửi thông báo" };
    } finally {
      set({ isSaving: false });
    }
  },

  async broadcast(payload) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.broadcast(payload);
      return res;
    } catch (error: any) {
      console.error("Error broadcasting notification:", error);
      return { success: false, message: error?.response?.data?.message || "Lỗi khi gửi broadcast" };
    } finally {
      set({ isSaving: false });
    }
  },

  async deleteNotification(id) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.notificationsAdmin.delete(id);
      return res;
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return { success: false, message: error?.response?.data?.message || "Lỗi khi xóa thông báo" };
    } finally {
      set({ isSaving: false });
    }
  },

  async loadUsers(search?: string) {
    set({ isLoadingUsers: true });
    try {
      const params: any = {
        per_page: 50,
      };
      if (search && search.length >= 2) {
        params.search = search;
      }
      const res = await RepositoryManager.users.getUsers(params);
      if (res && (res.success || res.data)) {
        let usersArray: User[] = [];
        if (res.data?.users && Array.isArray(res.data.users)) {
          usersArray = res.data.users;
        } else if (res.data?.data?.users && Array.isArray(res.data.data.users)) {
          usersArray = res.data.data.users;
        } else if (Array.isArray(res.data?.data)) {
          usersArray = res.data.data;
        } else if (Array.isArray(res.data)) {
          usersArray = res.data;
        }
        set({ usersList: usersArray });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      message.error("Không thể tải danh sách người dùng");
      set({ usersList: [] });
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  clearUsersList: () => {
    set({ usersList: [] });
  },
}));

export default useNotificationsStore;

