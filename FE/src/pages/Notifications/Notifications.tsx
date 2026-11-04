"use client";

import React, { useState } from "react";
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
  Modal,
  Radio,
  Switch,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;
const { Option } = Select;

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type?: string;
  user_id?: number | null;
  user?: { id: number; name: string; email: string } | null;
  is_broadcast: boolean;
  created_at: string;
  updated_at?: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

const INITIAL_USERS: UserOption[] = [
  { id: 1, name: "Admin Trô Về", email: "admin@trove.vn" },
  { id: 2, name: "Nguyễn Văn An", email: "an.nguyen@gmail.com" },
  { id: 3, name: "Trần Thị Mai", email: "mai.tran@gmail.com" },
  { id: 4, name: "Lê Hoàng Nam", email: "nam.le@gmail.com" },
  { id: 5, name: "Phạm Thu Hương", email: "huong.pham@gmail.com" },
  { id: 6, name: "Võ Minh Đức", email: "duc.vo@gmail.com" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Chào mừng bạn đến với ứng dụng Trô Về!",
    content: "Khám phá các địa điểm hẹn hò lãng mạn, các quán cà phê chill và tạo lịch trình hẹn hò thú vị ngay hôm nay.",
    type: "system",
    user_id: null,
    user: null,
    is_broadcast: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Bảo trì nâng cấp hệ thống máy chủ định kỳ",
    content: "Hệ thống sẽ tạm thời gián đoạn trong 30 phút từ 02:00 đến 02:30 sáng ngày mai để bảo trì nâng cấp hiệu năng.",
    type: "system",
    user_id: null,
    user: null,
    is_broadcast: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 3,
    title: "Địa điểm 'The Dome Kaffe' của bạn đã được phê duyệt!",
    content: "Chúc mừng bạn, địa điểm bạn đóng góp đã được ban quản trị xét duyệt và hiển thị công khai trên ứng dụng.",
    type: "place_approved",
    user_id: 2,
    user: { id: 2, name: "Nguyễn Văn An", email: "an.nguyen@gmail.com" },
    is_broadcast: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 4,
    title: "Nhắc nhở hoàn thiện hồ sơ cá nhân",
    content: "Hãy cập nhật thêm sở thích và nhóm hoạt động yêu thích để hệ thống gợi ý điểm hẹn phù hợp nhất với bạn.",
    type: "reminder",
    user_id: 3,
    user: { id: 3, name: "Trần Thị Mai", email: "mai.tran@gmail.com" },
    is_broadcast: false,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 5,
    title: "Ưu đãi thành viên mới: Giảm 20% khi đặt dịch vụ",
    content: "Nhập mã TROVE20 để nhận ngay ưu đãi 20% cho lịch hẹn hò đầu tiên tại các đối tác ẩm thực liên kết.",
    type: "promotion",
    user_id: null,
    user: null,
    is_broadcast: true,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export default function Notifications() {
  const { t } = useLanguageStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendType, setSendType] = useState<"user" | "users" | "broadcast">("user");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersList] = useState<UserOption[]>(INITIAL_USERS);
  const [sendForm] = Form.useForm();

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleView = (item: NotificationItem) => {
    setSelectedNotification(item);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    message.success("Đã xóa thông báo thành công");
  };

  const handleOpenSendModal = () => {
    setIsSendModalOpen(true);
    setSendType("user");
    sendForm.resetFields();
    sendForm.setFieldsValue({ push: true });
  };

  const handleSendNotification = async () => {
    try {
      const values = await sendForm.validateFields();
      setIsSubmitting(true);

      setTimeout(() => {
        const newNotifications: NotificationItem[] = [];

        if (sendType === "broadcast") {
          newNotifications.push({
            id: Date.now(),
            title: values.title,
            content: values.message,
            type: "broadcast",
            user_id: null,
            user: null,
            is_broadcast: true,
            created_at: new Date().toISOString(),
          });
        } else if (sendType === "user") {
          const u = usersList.find((usr) => usr.id === values.user_id);
          newNotifications.push({
            id: Date.now(),
            title: values.title,
            content: values.message,
            type: "user",
            user_id: values.user_id,
            user: u ? { id: u.id, name: u.name, email: u.email } : null,
            is_broadcast: false,
            created_at: new Date().toISOString(),
          });
        } else if (sendType === "users") {
          const selectedUserIds: number[] = values.user_ids || [];
          selectedUserIds.forEach((uid, index) => {
            const u = usersList.find((usr) => usr.id === uid);
            newNotifications.push({
              id: Date.now() + index,
              title: values.title,
              content: values.message,
              type: "user",
              user_id: uid,
              user: u ? { id: u.id, name: u.name, email: u.email } : null,
              is_broadcast: false,
              created_at: new Date().toISOString(),
            });
          });
        }

        setNotifications((prev) => [...newNotifications, ...prev]);
        setIsSubmitting(false);
        setIsSendModalOpen(false);
        sendForm.resetFields();
        message.success(
          `Gửi thông báo thành công! ${values.push ? "(Đã gửi kèm push notification)" : ""}`
        );
      }, 400);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnsType<NotificationItem> = [
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-bell text-black dark:text-white"></i>
          <span className="font-semibold">{t("notifications.notification") || "Thông báo"}</span>
        </span>
      ),
      key: "notification",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-gray-900 dark:text-gray-100">{record.title}</div>
          <div className="text-xs text-gray-500 line-clamp-2">{record.content}</div>
          <div className="text-xs text-gray-400">
            {new Date(record.created_at).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-user text-black dark:text-white"></i>
          <span className="font-semibold">{t("notifications.recipient") || "Người nhận"}</span>
        </span>
      ),
      key: "recipient",
      width: 240,
      render: (_, record) => {
        if (record.is_broadcast) {
          return <Tag color="blue">{t("notifications.allUsers") || "Tất cả người dùng"}</Tag>;
        } else if (record.user) {
          return (
            <div className="space-y-1 text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">{record.user.name}</div>
              <div className="text-xs text-gray-500">{record.user.email}</div>
            </div>
          );
        } else {
          return <Tag>N/A</Tag>;
        }
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-tag text-black dark:text-white"></i>
          <span className="font-semibold">{t("notifications.type") || "Loại"}</span>
        </span>
      ),
      key: "type",
      width: 140,
      render: (_, record) => {
        if (record.is_broadcast) {
          return <Tag color="purple">Broadcast</Tag>;
        } else if (record.user_id) {
          return <Tag color="green">{t("notifications.individual") || "Cá nhân"}</Tag>;
        }
        return <Tag>N/A</Tag>;
      },
    },
    {
      title: <span className="font-semibold">{t("notifications.actions") || "Thao tác"}</span>,
      key: "action",
      align: "center",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            icon={<i className="fa-solid fa-eye" />}
            onClick={() => handleView(record)}
          />
          <Popconfirm
            title={t("notifications.deleteConfirm") || "Bạn có chắc muốn xóa thông báo này?"}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes") || "Có"}
            cancelText={t("common.no") || "Không"}
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
    total: notifications.length,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} thông báo`,
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Trang chủ"}</span>
          <span>/</span>
          <span className="text-black dark:text-white">
            {t("navigation.notifications") || "Thông báo"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {t("notifications.title") || "Quản lý Thông báo"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <Button
              type="primary"
              icon={<i className="fa-solid fa-paper-plane mr-2" />}
              onClick={handleOpenSendModal}
              size="large"
            >
              {t("notifications.addNew") || "Gửi thông báo"}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={notifications}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
          />
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-bell text-blue-500"></i>
            Chi tiết thông báo
          </span>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={540}
        destroyOnClose
      >
        {selectedNotification && (
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Tiêu đề
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {selectedNotification.title}
              </h3>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Nội dung
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                {selectedNotification.content}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Hình thức gửi:</span>
                <span>
                  {selectedNotification.is_broadcast ? (
                    <Tag color="purple">Broadcast (Tất cả người dùng)</Tag>
                  ) : (
                    <Tag color="green">Gửi đích danh</Tag>
                  )}
                </span>
              </div>
              {selectedNotification.user && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Người nhận:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedNotification.user.name} ({selectedNotification.user.email})
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Thời gian tạo:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(selectedNotification.created_at).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Send Notification Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-paper-plane text-blue-500"></i>
            Gửi thông báo hệ thống
          </span>
        }
        open={isSendModalOpen}
        onCancel={() => {
          setIsSendModalOpen(false);
          sendForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsSendModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendNotification}
            loading={isSubmitting}
          >
            Gửi thông báo
          </Button>,
        ]}
        width={600}
      >
        <Form form={sendForm} layout="vertical">
          <Form.Item label="Đối tượng nhận thông báo">
            <Radio.Group
              value={sendType}
              onChange={(e) => {
                setSendType(e.target.value);
                sendForm.setFieldsValue({
                  user_id: undefined,
                  user_ids: undefined,
                });
              }}
            >
              <Radio value="user">1 người dùng</Radio>
              <Radio value="users">Nhiều người dùng</Radio>
              <Radio value="broadcast">Toàn bộ hệ thống (Broadcast)</Radio>
            </Radio.Group>
          </Form.Item>

          {sendType === "user" && (
            <Form.Item
              name="user_id"
              label="Chọn người nhận"
              rules={[{ required: true, message: "Vui lòng chọn người nhận" }]}
            >
              <Select
                showSearch
                placeholder="Tìm kiếm người dùng..."
                optionFilterProp="children"
              >
                {usersList.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {sendType === "users" && (
            <Form.Item
              name="user_ids"
              label="Chọn danh sách người nhận"
              rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 người nhận" }]}
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Chọn người dùng..."
                optionFilterProp="children"
              >
                {usersList.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { max: 255, message: "Tiêu đề không được vượt quá 255 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Cập nhật tính năng mới..." maxLength={255} />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung thông báo"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung" },
              { max: 1000, message: "Nội dung không được vượt quá 1000 ký tự" },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="Nhập nội dung thông báo gửi đến người dùng..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="push"
            label="Gửi kèm thông báo đẩy (Push Notification)"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

