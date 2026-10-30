"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Tag,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  TICKET_TYPE_CONFIG,
  TICKET_STATUS_CONFIG,
  TicketTypeEnum,
  type TicketStatus,
} from "./TicketEnums.ts";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  type: TicketTypeEnum;
  status: TicketStatus;
  admin_id?: number | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  admin?: {
    id: number;
    name: string;
  };
}

// Mock Data phục vụ demo UI báo cáo
const INITIAL_TICKETS: Ticket[] = [
  {
    id: 1,
    user_id: 101,
    subject: "Lỗi không tìm kiếm được địa điểm theo khu vực",
    description: "Khi lọc khu vực Quận 1 thì hệ thống tải mãi không ra danh sách địa điểm.",
    type: TicketTypeEnum.BUG_REPORT,
    status: "open",
    admin_id: null,
    admin_notes: null,
    created_at: "2026-10-30T09:15:00Z",
    updated_at: "2026-10-30T09:15:00Z",
    user: { id: 101, name: "Nguyễn Văn An", email: "an.nguyen@gmail.com" },
  },
  {
    id: 2,
    user_id: 102,
    subject: "Đề xuất thêm tính năng lưu hành trình du lịch dạng PDF",
    description: "Em muốn xuất lịch trình chi tiết ra file PDF hoặc ảnh để dễ dàng chia sẻ cho nhóm bạn.",
    type: TicketTypeEnum.FEATURE_REQUEST,
    status: "in_progress",
    admin_id: 1,
    admin_notes: "Đã chuyển yêu cầu cho team Mobile & Backend phân tích.",
    created_at: "2026-10-29T14:20:00Z",
    updated_at: "2026-10-30T08:00:00Z",
    user: { id: 102, name: "Trần Thị Bình", email: "binh.tran@gmail.com" },
    admin: { id: 1, name: "Admin Quản Trị" },
  },
  {
    id: 3,
    user_id: 103,
    subject: "Cuối tuần rảnh không admin ơi, đi cafe bàn thêm về app",
    description: "Thấy ứng dụng Trove hay quá, muốn rủ admin đi làm cốc cafe giao lưu học hỏi kinh nghiệm lập trình.",
    type: TicketTypeEnum.INVITE_ADMIN,
    status: "resolved",
    admin_id: 1,
    admin_notes: "Đã phản hồi cảm ơn và hẹn giao lưu tại sự kiện cộng đồng.",
    created_at: "2026-10-28T10:00:00Z",
    updated_at: "2026-10-29T11:00:00Z",
    user: { id: 103, name: "Lê Hoàng Cường", email: "cuong.le@gmail.com" },
    admin: { id: 1, name: "Admin Quản Trị" },
  },
  {
    id: 4,
    user_id: 104,
    subject: "Giao diện dark mode một số chỗ bị chìm chữ",
    description: "Ở trang danh sách bài viết khi bật dark mode thì tiêu đề màu xám hơi khó đọc.",
    type: TicketTypeEnum.FEEDBACK,
    status: "in_progress",
    admin_id: 1,
    admin_notes: "Đang kiểm tra lại bảng màu Tailwind CSS của theme dark.",
    created_at: "2026-10-27T16:45:00Z",
    updated_at: "2026-10-28T09:30:00Z",
    user: { id: 104, name: "Phạm Minh Dũng", email: "dung.pm@gmail.com" },
    admin: { id: 1, name: "Admin Quản Trị" },
  },
  {
    id: 5,
    user_id: 105,
    subject: "Tốc độ tải ảnh bài viết hơi chậm vào giờ cao điểm",
    description: "Buổi tối load ảnh trên feed mất tầm 3-5 giây mới hiện đủ ảnh.",
    type: TicketTypeEnum.COMPLAIN,
    status: "closed",
    admin_id: 1,
    admin_notes: "Đã tối ưu hóa CDN và nén ảnh tự động qua Cloudinary.",
    created_at: "2026-10-25T19:30:00Z",
    updated_at: "2026-10-26T15:00:00Z",
    user: { id: 105, name: "Hoàng Thị Em", email: "em.hoang@gmail.com" },
    admin: { id: 1, name: "Admin Quản Trị" },
  },
];

export default function Tickets() {
  const { t } = useLanguageStore();

  const [ticketsList, setTicketsList] = useState<Ticket[]>(INITIAL_TICKETS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusForm] = Form.useForm();

  // Lọc dữ liệu theo UI
  const filteredTickets = ticketsList.filter((item) => {
    if (typeFilter !== undefined && item.type !== typeFilter) return false;
    if (statusFilter !== undefined && item.status !== statusFilter) return false;
    return true;
  });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
    statusForm.setFieldsValue({
      status: ticket.status,
      admin_notes: ticket.admin_notes || "",
    });
  };

  const handleDelete = (id: number) => {
    setTicketsList((prev) => prev.filter((item) => item.id !== id));
    message.success("Đã xóa vé hỗ trợ");
  };

  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      if (!selectedTicket) return;

      setTicketsList((prev) =>
        prev.map((item) =>
          item.id === selectedTicket.id
            ? {
                ...item,
                status: values.status,
                admin_notes: values.admin_notes,
                admin: item.admin || { id: 1, name: "Admin Quản Trị" },
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      message.success("Cập nhật trạng thái thành công");
      setIsDrawerOpen(false);
    } catch {
      // Form validation error
    }
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-ticket text-black"></i>
          <span className="font-semibold">Ticket</span>
        </span>
      ),
      key: "ticket",
      render: (_, record) => {
        const typeCfg = TICKET_TYPE_CONFIG[record.type];
        return (
          <div>
            <div className="font-semibold text-gray-900">{record.subject}</div>
            {record.description && (
              <div className="text-xs text-gray-600 mt-1 italic max-w-md whitespace-pre-wrap">
                {record.description}
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
              {typeCfg && (
                <Tag
                  color={typeCfg.color}
                  className="rounded-full px-3 py-0.5 border-0 flex items-center gap-1"
                >
                  <i className={`fa-solid ${typeCfg.icon}`}></i>
                  {typeCfg.label}
                </Tag>
              )}
              <span>
                {new Date(record.created_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-user text-black"></i>
          <span className="font-semibold">{t("tickets.user") || "Người gửi"}</span>
        </span>
      ),
      key: "user",
      render: (_, record) =>
        record.user ? (
          <div className="space-y-1 text-sm">
            <div className="font-medium text-gray-900">{record.user.name}</div>
            <div className="text-xs text-gray-500">{record.user.email || `ID: ${record.user_id}`}</div>
          </div>
        ) : (
          <Tag>Unknown</Tag>
        ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-black"></i>
          <span className="font-semibold">{t("tickets.status") || "Trạng thái"}</span>
        </span>
      ),
      key: "status",
      render: (_, record) => {
        const cfg = TICKET_STATUS_CONFIG[record.status] || { label: record.status, color: "default" };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-user-shield text-black"></i>
          <span className="font-semibold">Quản trị viên</span>
        </span>
      ),
      key: "admin",
      render: (_, record) =>
        record.admin ? (
          <Tag color="purple">{record.admin.name}</Tag>
        ) : (
          <Tag color="default">Chưa phân công</Tag>
        ),
    },
    {
      title: <span className="font-semibold">{t("quotes.actions") || "Hành động"}</span>,
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            icon={<i className="fa-solid fa-eye" />}
            onClick={() => handleView(record)}
          />
          <Popconfirm
            title="Xóa vé hỗ trợ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              className="hover:bg-red-50"
              icon={<i className="fa-solid fa-trash" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: filteredTickets.length,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} vé`,
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Trang chủ"}</span>
          <span>/</span>
          <span className="text-black">{t("navigation.tickets") || "Hỗ trợ & Góp ý"}</span>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("tickets.title") || "Quản lý vé hỗ trợ & phản hồi"}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                placeholder="Loại yêu cầu"
                allowClear
                style={{ width: 220 }}
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
              >
                {Object.entries(TICKET_TYPE_CONFIG).map(([value, cfg]) => (
                  <Select.Option key={value} value={Number(value)}>
                    <i className={`fa-solid ${cfg.icon} mr-2`} />
                    {cfg.label}
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Trạng thái"
                allowClear
                style={{ width: 180 }}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                {Object.entries(TICKET_STATUS_CONFIG).map(([key, cfg]) => (
                  <Select.Option key={key} value={key}>
                    {cfg.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredTickets}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
            scroll={{ x: 900 }}
          />
        </div>
      </div>

      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-ticket text-black"></i>
            Chi tiết vé hỗ trợ
          </span>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={600}
        destroyOnHidden
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleUpdateStatus}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {selectedTicket && (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-1">{selectedTicket.subject}</h3>
              {selectedTicket.description && (
                <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              )}
            </div>

            <Form form={statusForm} layout="vertical">
              <Form.Item
                name="status"
                label="Trạng thái xử lý"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select>
                  {Object.entries(TICKET_STATUS_CONFIG).map(([key, cfg]) => (
                    <Select.Option key={key} value={key}>
                      {cfg.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="admin_notes"
                label="Ghi chú admin"
              >
                <TextArea rows={4} placeholder="Nhập ghi chú xử lý..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </>
  );
}

