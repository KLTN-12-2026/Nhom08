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
  Spin,
  message,
  Switch,
  Card,
  Space,
  Avatar,
  Modal,
} from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useUsersStore, { User as UserData } from "./UsersStore.ts";
import { getProvinceName } from "../../utils/addressUtils.ts";
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../stores/languageStore.ts";

export default function Users() {
  const { t } = useLanguageStore();
  const {
    getListUser,
    getUser,
    createUser,
    updateUser,
    toggleBlockUser,
    usersData,
    userData,
    isListLoading,
    isDetailLoading,
    isSaving,
    isTogglingBlock,
    bulkDeleteUsers,
    isDeleting,
  } = useUsersStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = () => {
    const params = {
      page: currentPage,
      per_page: pageSize,
    };
    getListUser(params);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 30);
  };

  const handleViewUser = async (id: number) => {
    setIsEditMode(false);
    setIsDrawerOpen(true);
    const result = await getUser(id);
    if (!result.success) {
      message.error("Không thể tải dữ liệu người dùng");
    }
  };

  const handleEditUser = async (id: number) => {
    setIsEditMode(true);
    setIsDrawerOpen(true);
    form.resetFields();
    const result = await getUser(id);
    if (result.success && result.data) {
      form.setFieldsValue(result.data.data);
    } else {
      message.error("Không thể tải dữ liệu người dùng");
    }
  };

  const handleAddUser = () => {
    setIsAddMode(true);
    setIsEditMode(false);
    setIsDrawerOpen(true);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const result = await createUser(values);
      if (result.success) {
        setIsDrawerOpen(false);
        fetchUsers();
      } else {
        message.error("Tạo người dùng thất bại!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const id = userData?.data.id;
      if (!id) return;
      const result = await updateUser(id, values);
      if (result.success) {
        setIsDrawerOpen(false);
        fetchUsers();
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async (checked: boolean) => {
    const userId = userData?.data?.id;
    if (!userId) return;
    const result = await toggleBlockUser(userId, checked);
    if (result.success) {
      message.success(checked ? "Đã chặn người dùng" : "Đã mở chặn người dùng");
      await getUser(userId);
      fetchUsers();
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} người dùng?`,
      icon: <ExclamationCircleFilled />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const result = await bulkDeleteUsers(selectedRowKeys as number[]);
        if (result.success) {
          setSelectedRowKeys([]);
          // Ideally fetchUsers is not needed if store updates correctly, but good for sync
          if (usersData?.data.length === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1); // Go back if page empty
          } else {
            fetchUsers();
          }
        }
      },
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnsType<UserData> = [
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-user text-black"></i>
          <span className="font-semibold">{t("users.info")}</span>
        </span>
      ),
      key: "user_info",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar || undefined}
            size={40}
            className="border-2 border-primary-200 shadow-sm"
            style={{ backgroundColor: record.avatar ? undefined : "#FEF3C7" }}
          >
            {!record.avatar && (
              <span className="text-primary-600 font-bold">
                {record.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">{record.name}</div>
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <i className="fa-solid fa-envelope text-xs"></i>
              {record.email || record.username}
            </div>
            {record.phone_number && (
              <div className="text-gray-500 text-xs flex items-center gap-1">
                <i className="fa-solid fa-phone text-xs"></i>
                {record.phone_number}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-black"></i>
          <span className="font-semibold">{t("users.role")}</span>
        </span>
      ),
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const roleConfig: Record<string, { color: string; icon: string }> = {
          admin: { color: "gold", icon: "fa-crown" },
          user: { color: "blue", icon: "fa-user" },
          moderator: { color: "purple", icon: "fa-user-shield" },
        };
        const config = roleConfig[role] || {
          color: "default",
          icon: "fa-user",
        };
        return (
          <Tag
            color={config.color}
            icon={<i className={`fa-solid ${config.icon} mr-1`}></i>}
          >
            {role?.charAt(0).toUpperCase() + role?.slice(1) || "User"}
          </Tag>
        );
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-wallet text-black"></i>
          <span className="font-semibold">{t("users.wallet")}</span>
        </span>
      ),
      key: "wallet",
      render: (_, record) => (
        <div className="space-y-1">
          <Tag color="gold" icon={<i className="fa-solid fa-coins mr-1"></i>}>
            {record.wallet?.points ?? 0}{" "}
            {t("common.loading") === "Đang tải..." ? "điểm" : "points"}
          </Tag>
          <Tag color="purple" icon={<i className="fa-solid fa-star mr-1"></i>}>
            Level {record.wallet?.level ?? 1}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-chart-simple text-black"></i>
          <span className="font-semibold">{t("users.stats")}</span>
        </span>
      ),
      key: "stats",
      render: (_, record) => {
        const stats = record.stats ?? {};
        const isVn = t("common.loading") === "Đang tải...";
        return (
          <div className="space-y-1">
            <div className="flex gap-1">
              <Tag color="blue" className="text-xs">
                <i className="fa-solid fa-location-dot mr-1"></i>
                {stats.places_count ?? 0} {isVn ? "địa điểm" : "places"}
              </Tag>
            </div>
            <div className="flex gap-1">
              <Tag color="green" className="text-xs">
                <i className="fa-solid fa-star mr-1"></i>
                {stats.reviews_count ?? 0} {isVn ? "đánh giá" : "reviews"}
              </Tag>
              <Tag color="orange" className="text-xs">
                <i className="fa-solid fa-newspaper mr-1"></i>
                {stats.posts_count ?? 0} {isVn ? "bài đăng" : "posts"}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-black"></i>
          <span className="font-semibold">{t("users.status")}</span>
        </span>
      ),
      key: "status",
      render: (_, record) => (
        <div className="space-y-1">
          <Tag
            icon={
              record.is_blocked ? (
                <i className="fa-solid fa-ban mr-1"></i>
              ) : (
                <i className="fa-solid fa-circle-check mr-1"></i>
              )
            }
            color={record.is_blocked ? "error" : "success"}
          >
            {record.is_blocked
              ? t("common.loading") === "Đang tải..."
                ? "Bị chặn"
                : "Blocked"
              : t("common.loading") === "Đang tải..."
                ? "Hoạt động"
                : "Active"}
          </Tag>
          {!record.is_active && (
            <Tag
              color="warning"
              icon={<i className="fa-solid fa-pause mr-1"></i>}
            >
              {t("common.loading") === "Đang tải..."
                ? "Ngưng hoạt động"
                : "Inactive"}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: <span className="font-semibold">{t("users.actions")}</span>,
      key: "action",
      align: "center",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            icon={<i className="fa-solid fa-eye"></i>}
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleViewUser(record.id)}
          >
            {t("common.loading") === "Đang tải..." ? "Xem" : "View"}
          </Button>
          <Button
            icon={<i className="fa-solid fa-pen-to-square"></i>}
            type="text"
            className="text-green-500 hover:text-green-700 hover:bg-green-50"
            onClick={() => handleEditUser(record.id)}
          >
            {t("common.loading") === "Đang tải..." ? "Sửa" : "Edit"}
          </Button>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    current: usersData?.current_page || 1,
    pageSize: usersData?.per_page || 30,
    total: usersData?.total || 0,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      t("common.loading") === "Đang tải..."
        ? `${range[0]}-${range[1]} của ${total} người dùng`
        : `${range[0]}-${range[1]} of ${total} users`,
    pageSizeOptions: ["10", "20", "50", "100"],
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Home"}</span>
          <span>/</span>
          <span className="text-black">{t("navigation.users")}</span>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("users.title")}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6 overflow-x-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-primary-600">
                <i className="fa-solid fa-users text-black text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-black m-0">
                {t("common.loading") === "Đang tải..."
                  ? "Tất cả người dùng"
                  : "All Users"}
              </h3>
            </div>
            <div className="flex gap-3">
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  type="primary"
                  icon={<i className="fa-solid fa-trash"></i>}
                  onClick={handleBulkDelete}
                  loading={isDeleting}
                >
                  Xóa {selectedRowKeys.length} đã chọn
                </Button>
              )}
              <Button className="rounded-full border-gray-200 hover:border-primary-400 hover:text-primary-600">
                {t("common.loading") === "Đang tải..." ? "Bộ lọc" : "Filter"}
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-plus text-black"></i>}
                className="shadow-lg shadow-yellow-200/50"
                onClick={handleAddUser}
              >
                {t("users.addNew")}
              </Button>
            </div>
          </div>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={usersData?.data}
            loading={isListLoading}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i
              className={`fa-solid ${isAddMode ? "fa-user-plus" : "fa-user"} text-black`}
            ></i>
            {isAddMode
              ? "Thêm Người Dùng Mới"
              : isEditMode
                ? "Chỉnh Sửa Người Dùng"
                : "Chi Tiết Người Dùng"}
          </span>
        }
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setIsAddMode(false);
        }}
        width={520}
        destroyOnHidden
        footer={
          isAddMode ? (
            <div style={{ textAlign: "right" }}>
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsAddMode(false);
                }}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button type="primary" onClick={handleCreate} loading={isSaving}>
                Tạo Người Dùng
              </Button>
            </div>
          ) : isEditMode ? (
            <div style={{ textAlign: "right" }}>
              <Button
                onClick={() => setIsDrawerOpen(false)}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button type="primary" onClick={handleSave} loading={isSaving}>
                Lưu
              </Button>
            </div>
          ) : null
        }
      >
        {isAddMode ? (
          <Form form={form} layout="vertical" className="pt-4">
            <Form.Item
              name="name"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-user text-black"></i> Họ và Tên
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-black"></i> Email
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>

            <Form.Item
              name="username"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-at text-black"></i> Tên đăng nhập
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
              ]}
            >
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-black"></i> Mật khẩu
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              name="password_confirmation"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-lock-open text-black"></i> Xác nhận
                  mật khẩu
                </span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item
              name="role"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-black"></i> Vai
                  trò
                </span>
              }
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="phone_number"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-phone text-black"></i> Số Điện Thoại
                </span>
              }
            >
              <Input placeholder="Nhập số điện thoại (tuỳ chọn)" />
            </Form.Item>
          </Form>
        ) : isDetailLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : isEditMode ? (
          <Form form={form} layout="vertical" className="pt-4">
            <Form.Item
              name="name"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-user text-black"></i> Họ và Tên
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="phone_number"
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-phone text-black"></i> Số Điện Thoại
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label={
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-ban text-black"></i> Trạng Thái
                  Người Dùng
                </span>
              }
            >
              <Switch
                checked={userData?.data?.is_block === 1}
                checkedChildren="Bị chặn"
                unCheckedChildren="Hoạt động"
                loading={isTogglingBlock}
                onChange={(checked) => handleToggleBlock(checked)}
              />
            </Form.Item>
          </Form>
        ) : userData?.data ? (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-1">
                    Họ và Tên
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    {userData.data.name}
                  </p>
                  <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                    <i className="fa-solid fa-phone text-black"></i>{" "}
                    {userData.data.phone_number}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-orange-50 border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-wallet text-white text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600 text-sm mb-1">
                      Ví điểm
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {userData.data.wallet?.points ?? 0}
                    </p>
                  </div>
                </div>
              </Card>
              <Card
                className={
                  userData.data.is_block
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      userData.data.is_block ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {userData.data.is_block ? (
                      <i className="fa-solid fa-circle-xmark text-white text-lg"></i>
                    ) : (
                      <i className="fa-solid fa-circle-check text-white text-lg"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600 text-sm mb-1">
                      Trạng thái
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {userData.data.is_block ? "Bị chặn" : "Hoạt động"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-cyan-50 border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-1">
                    Khu Vực Hoạt Động
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(userData.data.activity_area) &&
                    userData.data.activity_area.length > 0 ? (
                      userData.data.activity_area.map((area) => (
                        <Tag color="blue" key={area}>
                          {getProvinceName(area)}
                        </Tag>
                      ))
                    ) : (
                      <Tag>Chưa có thông tin</Tag>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-chart-simple text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-2">
                    Thống Kê Chuyến Đi
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold text-blue-600">
                        {userData.data.statistics?.total_trips ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Tổng</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-600">
                        {userData.data.statistics?.completed_trips ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Hoàn thành</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-red-600">
                        {userData.data.statistics?.canceled_trips ?? 0}
                      </p>
                      <p className="text-xs text-gray-500">Đã hủy</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Không có dữ liệu người dùng
          </p>
        )}
      </Drawer>
    </>
  );
}
