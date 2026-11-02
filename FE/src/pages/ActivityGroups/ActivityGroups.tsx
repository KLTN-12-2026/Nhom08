"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Table,
  Tag,
  Drawer,
  Form,
  Input,
  Switch,
  Space,
  Popconfirm,
  InputNumber,
  Select,
  Spin,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useActivityGroupsStore, { ActivityGroup } from "./ActivityGroupsStore.ts";
import useCategoriesStore from "../Categories/CategoriesStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

export default function ActivityGroups() {
  const { t } = useLanguageStore();
  const {
    groups,
    pagination,
    isListLoading,
    isDetailLoading,
    isSaving,
    isDeleting,
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useActivityGroupsStore();

  const {
    categories,
    getCategories,
    isListLoading: isCategoriesLoading,
  } = useCategoriesStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const fetchGroups = () => {
    const params: any = {
      page: currentPage,
      per_page: pageSize,
    };
    if (searchText) {
      params.search = searchText;
    }
    getGroups(params);
  };

  useEffect(() => {
    fetchGroups();
    // Load categories phục vụ select box liên kết danh mục
    getCategories({ per_page: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchText]);

  const handleTableChange = (p: TablePaginationConfig) => {
    setCurrentPage(p.current || 1);
    setPageSize(p.pageSize || 10);
  };

  const handleSearch = (value: string) => {
    setSearchText(value.trim());
    setCurrentPage(1);
  };

  const handleAddGroup = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      display_order: (pagination.total || groups.length) + 1,
      is_active: true,
      categories: [],
    });
    setIsDrawerOpen(true);
  };

  const handleEditGroup = async (id: number) => {
    setIsEditMode(true);
    setEditingId(id);
    form.resetFields();
    setIsDrawerOpen(true);

    const res = await getGroupById(id);
    if (res?.success && res.data) {
      const data = res.data;
      form.setFieldsValue({
        key: data.key,
        name: data.name,
        description: data.description,
        display_order: data.display_order,
        is_active: Boolean(data.is_active),
        categories:
          data.categories?.map((cat: any) => ({
            category_id: cat.id,
            subtype_name: cat.subtype_name || undefined,
            display_order: cat.display_order || 0,
          })) || [],
      });
    }
  };

  const handleDeleteGroup = async (id: number) => {
    const res = await deleteGroup(id);
    if (res?.success) {
      if (groups.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchGroups();
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Format payload categories
      const payload: any = {
        name: values.name,
        description: values.description || null,
        display_order: values.display_order ?? 0,
        is_active: Boolean(values.is_active),
        categories: (values.categories || []).map((c: any) => ({
          category_id: c.category_id,
          subtype_name: c.subtype_name || null,
          display_order: c.display_order ?? 0,
        })),
      };

      let res;
      if (isEditMode && editingId) {
        res = await updateGroup(editingId, payload);
      } else {
        payload.key = values.key;
        res = await createGroup(payload);
      }

      if (res?.success) {
        setIsDrawerOpen(false);
        fetchGroups();
      }
    } catch {
      // Form validation error
    }
  };

  const columns: ColumnsType<ActivityGroup> = [
    {
      title: <span className="font-semibold">{t("activityGroups.key") || "Mã nhóm (Key)"}</span>,
      dataIndex: "key",
      key: "key",
      render: (text) => <Tag color="blue" className="font-mono">{text}</Tag>,
    },
    {
      title: <span className="font-semibold">{t("activityGroups.name") || "Tên nhóm hoạt động"}</span>,
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <span className="font-bold text-gray-900 text-sm">{text}</span>
          {record.categories && record.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {record.categories.map((c) => (
                <Tag key={c.id} color="cyan" className="text-[11px]">
                  {c.display_name || c.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: <span className="font-semibold">{t("activityGroups.description") || "Mô tả"}</span>,
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => <span className="text-gray-600">{text || "—"}</span>,
    },
    {
      title: <span className="font-semibold">{t("activityGroups.order") || "Thứ tự"}</span>,
      dataIndex: "display_order",
      key: "display_order",
      align: "center",
      width: 90,
      render: (order) => <span className="font-bold text-gray-700">{order}</span>,
    },
    {
      title: <span className="font-semibold">{t("activityGroups.status") || "Trạng thái"}</span>,
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      width: 140,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
        </Tag>
      ),
    },
    {
      title: <span className="font-semibold">{t("activityGroups.actions") || "Hành động"}</span>,
      key: "action",
      align: "center",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button
            icon={<i className="fa-solid fa-pen-to-square"></i>}
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleEditGroup(record.id)}
          />
          <Popconfirm
            title="Xóa nhóm hoạt động này?"
            description="Bạn có chắc muốn xóa nhóm hoạt động này?"
            onConfirm={() => handleDeleteGroup(record.id)}
            okText="Xóa"
            okButtonProps={{ danger: true, loading: isDeleting }}
            cancelText="Hủy"
          >
            <Button
              icon={<i className="fa-solid fa-trash"></i>}
              type="text"
              danger
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: pagination.total || groups.length,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} nhóm`,
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Trang chủ"}</span>
          <span>/</span>
          <span className="text-black">{t("navigation.activityGroups") || "Nhóm hoạt động"}</span>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("activityGroups.title") || "Quản lý nhóm hoạt động"}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-primary-600">
                <i className="fa-solid fa-layer-group text-black text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-black m-0">
                Tất cả nhóm hoạt động <span className="text-gray-400 font-medium text-base">({pagination.total || groups.length})</span>
              </h3>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Input.Search
                placeholder="Tìm kiếm nhóm hoạt động..."
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) handleSearch("");
                }}
                style={{ width: 250 }}
                className="rounded-xl"
                allowClear
                prefix={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
              />
              <Button icon={<i className="fa-solid fa-rotate-right mr-1" />} onClick={() => fetchGroups()}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-plus text-black"></i>}
                className="shadow-lg shadow-yellow-200/50"
                onClick={handleAddGroup}
              >
                {t("activityGroups.addNew") || "Thêm nhóm hoạt động"}
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={groups}
            loading={isListLoading}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
          />
        </div>
      </div>

      {/* Drawer: Thêm / Sửa Nhóm hoạt động */}
      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-layer-group text-black"></i>
            {isEditMode ? "Chỉnh sửa nhóm hoạt động" : "Thêm nhóm hoạt động mới"}
          </span>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={600}
        destroyOnHidden
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" onClick={handleSave} loading={isSaving}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {isDetailLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <Form form={form} layout="vertical" className="pt-4">
            <Form.Item
              name="key"
              label="Mã nhóm (Key)"
              rules={[{ required: true, message: "Vui lòng nhập từ khóa định danh" }]}
              extra="Chữ thường không dấu, dùng cho hệ thống nhận diện (ví dụ: food_drink, entertainment)"
            >
              <Input placeholder="e.g., food_drink" disabled={isEditMode} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên hiển thị nhóm"
              rules={[{ required: true, message: "Vui lòng nhập tên hiển thị nhóm" }]}
            >
              <Input placeholder="e.g., Ăn uống & Cà phê" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả nhóm hoạt động"
            >
              <Input.TextArea rows={3} placeholder="Mô tả các hoạt động nổi bật trong nhóm này..." />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="display_order"
                label="Thứ tự hiển thị"
                initialValue={1}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              <Form.Item
                name="is_active"
                label="Trạng thái hoạt động"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="Kích hoạt"
                  unCheckedChildren="Tắt"
                />
              </Form.Item>
            </div>

            {/* Categories Mapping Section */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">
                Liên kết các danh mục thuộc nhóm
              </h4>
              <Form.List name="categories">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <Form.Item
                          {...restField}
                          name={[name, "category_id"]}
                          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                          className="mb-0 flex-1"
                        >
                          <Select
                            placeholder="Chọn danh mục"
                            showSearch
                            loading={isCategoriesLoading}
                            optionFilterProp="label"
                            options={categories.map((c) => ({
                              value: c.id,
                              label: `${c.display_name} (${c.name})`,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "display_order"]}
                          initialValue={0}
                          className="mb-0 w-24"
                        >
                          <InputNumber placeholder="Thứ tự" className="w-full" />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<i className="fa-solid fa-trash"></i>}
                          onClick={() => remove(name)}
                        />
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<i className="fa-solid fa-plus"></i>}>
                      Thêm liên kết danh mục
                    </Button>
                  </div>
                )}
              </Form.List>
            </div>
          </Form>
        )}
      </Drawer>
    </>
  );
}
