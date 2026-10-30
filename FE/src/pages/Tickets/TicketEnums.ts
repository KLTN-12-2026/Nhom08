export enum TicketTypeEnum {
  FEATURE_REQUEST = 0, // Đề xuất tính năng mới
  BUG_REPORT = 1, // Báo lỗi ứng dụng
  COMPLAIN = 2, // Nói xấu cho admin
  FEEDBACK = 3, // Góp ý
  INVITE_ADMIN = 4, // Rủ admin đi chơi
}

export const TICKET_TYPE_CONFIG: Record<
  number,
  { label: string; icon: string; color: string }
> = {
  [TicketTypeEnum.FEATURE_REQUEST]: {
    label: "Đề xuất tính năng",
    icon: "fa-lightbulb",
    color: "gold",
  },
  [TicketTypeEnum.BUG_REPORT]: {
    label: "Báo lỗi ứng dụng",
    icon: "fa-bug",
    color: "red",
  },
  [TicketTypeEnum.COMPLAIN]: {
    label: "Nói xấu cho admin",
    icon: "fa-face-angry",
    color: "volcano",
  },
  [TicketTypeEnum.FEEDBACK]: {
    label: "Góp ý",
    icon: "fa-comment-dots",
    color: "blue",
  },
  [TicketTypeEnum.INVITE_ADMIN]: {
    label: "Rủ admin đi chơi",
    icon: "fa-champagne-glasses",
    color: "purple",
  },
};

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  open: { label: "Mới tạo", color: "default" },
  in_progress: { label: "Đang xử lý", color: "processing" },
  resolved: { label: "Đã giải quyết", color: "success" },
  closed: { label: "Đã đóng", color: "magenta" },
};

