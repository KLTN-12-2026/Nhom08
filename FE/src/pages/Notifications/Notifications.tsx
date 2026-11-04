"use client";

import React, { useState, useEffect } from "react";
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
  message,
  Modal,
  Radio,
  Switch,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useNotificationsStore, { Notification } from "./NotificationsStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;
const { Option } = Select;

export default function Notifications() {
  const { t } = useLanguageStore();
  const {
    getNotifications,
    getNotificationById,
    sendToUser,
    sendToUsers,
    broadcast,
    deleteNotification,
    loadUsers,
    clearUsersList,
    notificationsData,
    notificationDetail,
    isListLoading,
    isDetailLoading,
    isSaving,
    usersList,
    isLoadingUsers,
  } = useNotificationsStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendType, setSendType] = useState<"user" | "users" | "broadcast">("user");
  const [sendForm] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, pageSize]);

  const fetchNotifications = () => {
    const params: any = {
      page: currentPage,
      per_page: pageSize,
    };
    getNotifications(params);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleView = async (id: number) => {
    const res = await getNotificationById(id);
    if (res && (res.success || res.data)) {
      setIsDrawerOpen(true);
    } else {
      message.error("Không thể tải chi tiết thông báo");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteNotification(id);
    if (res && res.success !== false) {
      message.success("Đã xóa thông báo thành công");
      fetchNotifications();
    } else {
      message.error(res?.message || "Xóa thông báo thất bại");
    }
  };

  const handleOpenSendModal = () => {
    setIsSendModalOpen(true);
    setSendType("user");
    sendForm.resetFields();
    sendForm.setFieldsValue({ push: true });
    clearUsersList();
    loadUsers();
  };

  const handleSearchUsers = (search: string) => {
    if (!search || search.length < 2) {
      loadUsers();
      return;
    }
    loadUsers(search);
  };

  const handleSendNotification = async () => {
    try {
      const values = await sendForm.validateFields();
      let res;

      if (sendType === "user") {
        res = await sendToUser({
          user_id: values.user_id,
          title: values.title,
          message: values.message,
          type: "admin",
          push: values.push,
        });
      } else if (sendType === "users") {
        res = await sendToUsers({
          user_ids: values.user_ids,
          title: values.title,
          message: values.message,
          type: "admin",
          push: values.push,
        });
      } else {
        res = await broadcast({
          title: values.title,
          message: values.message,
          type: "system",
          push: values.push,
        });
      }

      if (res && (res.success || res.statusCode === 201 || !res.error)) {
        message.success("Gửi thông báo thành công");
        setIsSendModalOpen(false);
        sendForm.resetFields();
        fetchNotifications();
      } else {
        message.error(res?.message || "Gửi thông báo thất bại");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Safely extract table data array & pagination metadata
  const listItems: Notification[] = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.data || notificationsData?.notifications || [];

  const totalItems =
    notificationsData?.total ||
    notificationsData?.pagination?.total ||
    listItems.length;

  const columns: ColumnsType<Notification> = [
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
          <div className="text-xs text-gray-500 line-clamp-2">
            {record.message || record.content}
          </div>
          <div className="text-xs text-gray-400">
            {record.created_at
              ? new Date(record.created_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
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
        if (record.is_broadcast || !record.user_id) {
          return <Tag color="blue">{t("notifications.allUsers") || "Tất cả người dùng"}</Tag>;
        } else if (record.user) {
          return (
            <div className="space-y-1 text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">{record.user.name}</div>
              <div className="text-xs text-gray-500">{record.user.email || record.user.username}</div>
            </div>
          );
        } else {
          return <Tag color="cyan">User #{record.user_id}</Tag>;
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
        if (record.is_broadcast || !record.user_id) {
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
            onClick={() => handleView(record.id)}
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
    total: totalItems,
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
            dataSource={listItems}
            loading={isListLoading}
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
        width={560}
        destroyOnClose
      >
        {isDetailLoading || !notificationDetail ? (
          <div className="flex justify-center items-center h-40">
            <Spin tip="Đang tải..." />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Tiêu đề
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {notificationDetail.title}
              </h3>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Nội dung
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                {notificationDetail.message || notificationDetail.content}
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Hình thức gửi:</span>
                <span>
                  {notificationDetail.is_broadcast || !notificationDetail.user_id ? (
                    <Tag color="purple">Broadcast (Tất cả người dùng)</Tag>
                  ) : (
                    <Tag color="green">Gửi cá nhân</Tag>
                  )}
                </span>
              </div>
              {notificationDetail.user && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Người nhận:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {notificationDetail.user.name} ({notificationDetail.user.email || notificationDetail.user.username})
                  </span>
                </div>
              )}
              {notificationDetail.user_id && !notificationDetail.user && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Mã người nhận (User ID):</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    #{notificationDetail.user_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Thời gian tạo:</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {notificationDetail.created_at
                    ? new Date(notificationDetail.created_at).toLocaleString("vi-VN")
                    : "N/A"}
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
          clearUsersList();
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsSendModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleSendNotification}
            loading={isSaving}
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
                const newType = e.target.value;
                setSendType(newType);
                sendForm.setFieldsValue({
                  user_id: undefined,
                  user_ids: undefined,
                });
                if ((newType === "user" || newType === "users") && usersList.length === 0) {
                  loadUsers();
                }
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
                filterOption={false}
                onSearch={handleSearchUsers}
                loading={isLoadingUsers}
                notFoundContent={isLoadingUsers ? <Spin size="small" /> : "Không tìm thấy người dùng"}
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
                placeholder="Tìm kiếm và chọn nhiều người dùng..."
                filterOption={false}
                onSearch={handleSearchUsers}
                loading={isLoadingUsers}
                notFoundContent={isLoadingUsers ? <Spin size="small" /> : "Không tìm thấy người dùng"}
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
