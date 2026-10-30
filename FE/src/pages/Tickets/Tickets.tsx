"use client";

import { useState, useEffect } from "react";
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
  Spin,
  Modal,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useTicketsStore, { Ticket } from "./TicketsStore.ts";
import {
  TICKET_TYPE_CONFIG,
  TICKET_STATUS_CONFIG,
  TicketTypeEnum,
  type TicketStatus,
} from "./TicketEnums.ts";
import useLanguageStore from "../../stores/languageStore.ts";
import toast from "react-hot-toast";

const { TextArea } = Input;

export default function Tickets() {
  const { t } = useLanguageStore();
  const {
    tickets,
    pagination,
    ticketDetail,
    isListLoading,
    isDetailLoading,
    isSaving,
    getTickets,
    getTicketById,
    createTicket,
    updateStatus,
    deleteTicket,
  } = useTicketsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);

  // Modal / Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [statusForm] = Form.useForm();
  const [createForm] = Form.useForm();

  const fetchTickets = () => {
    const params: any = {
      page: currentPage,
      per_page: pageSize,
      type: typeFilter,
      status: statusFilter,
    };
    getTickets(params);
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, typeFilter, statusFilter]);

  const handleTableChange = (p: TablePaginationConfig) => {
    setCurrentPage(p.current || 1);
    setPageSize(p.pageSize || 10);
  };

  const handleView = async (id: number) => {
    setIsDrawerOpen(true);
    const res = await getTicketById(id);
    if (res?.success && res.data) {
      statusForm.setFieldsValue({
        status: res.data.status,
        admin_notes: res.data.admin_notes || "",
      });
    } else {
      toast.error("Không thể tải chi tiết vé hỗ trợ");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteTicket(id);
    if (res?.success) {
      toast.success("Đã xóa vé hỗ trợ thành công");
      fetchTickets();
    } else {
      toast.error(res?.message || "Xóa vé hỗ trợ thất bại");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      if (!ticketDetail) return;
      const res = await updateStatus(
        ticketDetail.id,
        values.status,
        values.admin_notes
      );
      if (res?.success) {
        toast.success("Cập nhật trạng thái thành công");
        setIsDrawerOpen(false);
        fetchTickets();
      } else {
        toast.error(res?.message || "Cập nhật trạng thái thất bại");
      }
    } catch {
      // Validate error
    }
  };

  const handleCreateTicket = async () => {
    try {
      const values = await createForm.validateFields();
      const res = await createTicket({
        subject: values.subject,
        description: values.description,
        type: values.type,
      });

      if (res?.success) {
        toast.success("Tạo vé hỗ trợ mới thành công");
        setIsCreateModalOpen(false);
        createForm.resetFields();
        fetchTickets();
      } else {
        toast.error(res?.message || "Tạo vé hỗ trợ thất bại");
      }
    } catch {
      // Validate error
    }
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-ticket text-black"></i>
          <span className="font-semibold">Vé hỗ trợ</span>
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
                {record.created_at
                  ? new Date(record.created_at).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
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
          <Tag color="default">ID: {record.user_id}</Tag>
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
        const cfg = TICKET_STATUS_CONFIG[record.status] || {
          label: record.status,
          color: "default",
        };
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
            onClick={() => handleView(record.id)}
          />
          <Popconfirm
            title="Xóa vé hỗ trợ này?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            okButtonProps={{ danger: true, loading: isSaving }}
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
    total: pagination.total || tickets.length,
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

            <div className="flex items-center gap-3">
              <Button icon={<i className="fa-solid fa-rotate-right mr-1" />} onClick={() => fetchTickets()}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-plus text-black mr-1" />}
                onClick={() => {
                  createForm.resetFields();
                  createForm.setFieldsValue({ type: TicketTypeEnum.FEEDBACK });
                  setIsCreateModalOpen(true);
                }}
              >
                Tạo vé hỗ trợ
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={tickets}
            loading={isListLoading}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
            scroll={{ x: 900 }}
          />
        </div>
      </div>

      {/* Drawer: Xem chi tiết & Cập nhật trạng thái */}
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
              loading={isSaving}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {isDetailLoading || !ticketDetail ? (
          <div className="flex justify-center items-center h-40">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <>
            <div className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                {TICKET_TYPE_CONFIG[ticketDetail.type] && (
                  <Tag color={TICKET_TYPE_CONFIG[ticketDetail.type].color} className="rounded-full">
                    <i className={`fa-solid ${TICKET_TYPE_CONFIG[ticketDetail.type].icon} mr-1`}></i>
                    {TICKET_TYPE_CONFIG[ticketDetail.type].label}
                  </Tag>
                )}
                <Tag color={TICKET_STATUS_CONFIG[ticketDetail.status]?.color || "default"}>
                  {TICKET_STATUS_CONFIG[ticketDetail.status]?.label || ticketDetail.status}
                </Tag>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{ticketDetail.subject}</h3>
              {ticketDetail.description && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-2 mb-0">
                  {ticketDetail.description}
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                <span>Người gửi: <strong>{ticketDetail.user?.name || `ID: ${ticketDetail.user_id}`}</strong></span>
                <span>
                  {ticketDetail.created_at
                    ? new Date(ticketDetail.created_at).toLocaleString("vi-VN")
                    : ""}
                </span>
              </div>
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
                <TextArea rows={4} placeholder="Nhập ghi chú xử lý vé này..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>

      {/* Modal: Tạo vé hỗ trợ mới (Create) */}
      <Modal
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-plus text-black"></i>
            Tạo vé hỗ trợ mới
          </span>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateTicket}
        confirmLoading={isSaving}
        okText="Tạo vé"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="subject"
            label="Tiêu đề yêu cầu"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Ví dụ: Báo lỗi thanh toán vé, Góp ý tính năng..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại yêu cầu"
            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
          >
            <Select>
              {Object.entries(TICKET_TYPE_CONFIG).map(([value, cfg]) => (
                <Select.Option key={value} value={Number(value)}>
                  <i className={`fa-solid ${cfg.icon} mr-2`} />
                  {cfg.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Nội dung chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập nội dung chi tiết" }]}
          >
            <TextArea rows={4} placeholder="Mô tả cụ thể vấn đề hoặc ý kiến đóng góp..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
