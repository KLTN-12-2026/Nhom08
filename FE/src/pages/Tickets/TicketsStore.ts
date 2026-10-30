import { create } from "zustand";
import { RepositoryManager } from "../../data/repositoryManager";
import type { TicketStatus } from "./TicketEnums";

export interface Ticket {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email?: string } | null;
  subject: string;
  description?: string;
  type: number;
  type_label?: string;
  type_icon?: string;
  status: TicketStatus;
  admin_id: number | null;
  admin?: { id: number; name: string } | null;
  admin_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface TicketsState {
  tickets: Ticket[];
  pagination: Pagination;
  ticketDetail: Ticket | null;
  isListLoading: boolean;
  isDetailLoading: boolean;
  isSaving: boolean;

  getTickets: (params?: any) => Promise<any>;
  getTicketById: (id: number) => Promise<any>;
  createTicket: (payload: { subject: string; description: string; type: number }) => Promise<any>;
  updateStatus: (
    id: number,
    status: TicketStatus,
    notes?: string
  ) => Promise<any>;
  assignTicket: (id: number, adminId: number | null) => Promise<any>;
  deleteTicket: (id: number) => Promise<any>;
}

const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  ticketDetail: null,
  isListLoading: false,
  isDetailLoading: false,
  isSaving: false,

  async getTickets(params = {}) {
    set({ isListLoading: true });
    try {
      const res = await RepositoryManager.ticketsAdmin.getTickets(params);
      if (res?.success) {
        // Hỗ trợ cả trường hợp res.data là Array hoặc là paginated object
        if (Array.isArray(res.data)) {
          set({
            tickets: res.data,
            pagination: {
              current_page: params.page || 1,
              last_page: 1,
              per_page: params.per_page || 10,
              total: res.data.length,
            },
          });
        } else if (res.data?.data) {
          set({
            tickets: res.data.data,
            pagination: {
              current_page: res.data.current_page || 1,
              last_page: res.data.last_page || 1,
              per_page: res.data.per_page || 10,
              total: res.data.total || res.data.data.length,
            },
          });
        }
      }
      return res;
    } finally {
      set({ isListLoading: false });
    }
  },

  async getTicketById(id) {
    set({ isDetailLoading: true });
    try {
      const res = await RepositoryManager.ticketsAdmin.getDetail(id);
      if (res?.success) {
        set({ ticketDetail: res.data });
      }
      return res;
    } finally {
      set({ isDetailLoading: false });
    }
  },

  async createTicket(payload) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.ticketsUser.create(payload);
      return res;
    } finally {
      set({ isSaving: false });
    }
  },

  async updateStatus(id, status, notes) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.ticketsAdmin.updateStatus(id, {
        status,
        admin_notes: notes,
      });
      if (res?.success && res.data) {
        const updated = res.data;
        set({
          tickets: get().tickets.map((t) => (t.id === id ? { ...t, ...updated } : t)),
          ticketDetail: get().ticketDetail?.id === id ? { ...get().ticketDetail, ...updated } : get().ticketDetail,
        });
      }
      return res;
    } finally {
      set({ isSaving: false });
    }
  },

  async assignTicket(id, adminId) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.ticketsAdmin.assign(id, adminId);
      return res;
    } finally {
      set({ isSaving: false });
    }
  },

  async deleteTicket(id) {
    set({ isSaving: true });
    try {
      const res = await RepositoryManager.ticketsAdmin.delete(id);
      if (res?.success) {
        set({
          tickets: get().tickets.filter((t) => t.id !== id),
          pagination: {
            ...get().pagination,
            total: Math.max(0, get().pagination.total - 1),
          },
        });
      }
      return res;
    } finally {
      set({ isSaving: false });
    }
  },
}));

export default useTicketsStore;

