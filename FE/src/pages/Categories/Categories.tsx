"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  Space,
  Popconfirm,
  Spin,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useCategoriesStore, { Category } from "./CategoriesStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;

export default function Categories() {
  const { t } = useLanguageStore();
  const {
    categories,
    pagination,
    isListLoading,
    isDetailLoading,
    isSaving,
    isDeleting,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();

  const fetchCategories = () => {
    const params: any = {
      page: currentPage,
      per_page: pageSize,
    };
    if (searchText) {
      params.query = searchText;
    }
    getCategories(params);
  };

  useEffect(() => {
    fetchCategories();
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

  const handleAddCategory = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEditCategory = async (id: number) => {
    setIsEditMode(true);
    setEditingId(id);
    form.resetFields();
    setIsDrawerOpen(true);

    const res = await getCategoryById(id);
    if (res?.success && res.data) {
      form.setFieldsValue({
        name: res.data.name,
        display_name: res.data.display_name,
        description: res.data.description,
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await deleteCategory(id);
    if (res?.success) {
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCategories();
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (isEditMode && editingId) {
        res = await updateCategory(editingId, values);
      } else {
        res = await createCategory(values);
      }

      if (res?.success) {
        setIsDrawerOpen(false);
        fetchCategories();
      }
    } catch {
      // Form validation error
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-folder text-black"></i>
          <span className="font-semibold">{t("categories.name") || "Mã danh mục"}</span>
        </span>
      ),
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-mono">
          {text}
        </span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-tag text-black"></i>
          <span className="font-semibold">{t("categories.displayName") || "Tên hiển thị"}</span>
        </span>
      ),
      dataIndex: "display_name",
      key: "display_name",
      render: (text) => (
        <span className="font-bold text-gray-800 text-sm">{text}</span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <i className="fa-solid fa-align-left text-black"></i>
          <span className="font-semibold">{t("categories.description") || "Mô tả"}</span>
        </span>
      ),
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <span className="text-gray-600">{text || "—"}</span>
      ),
    },
    {
      title: <span className="font-semibold">{t("categories.actions") || "Hành động"}</span>,
      key: "action",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            icon={<i className="fa-solid fa-pen-to-square"></i>}
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleEditCategory(record.id)}
          />
          <Popconfirm
            title="Xóa danh mục này?"
            description="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.id)}
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
    total: pagination.total || categories.length,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} danh mục`,
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Trang chủ"}</span>
          <span>/</span>
          <span className="text-black">{t("navigation.categories") || "Danh mục"}</span>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("categories.title") || "Quản lý danh mục"}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-primary-600">
                <i className="fa-solid fa-folder text-black text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-black m-0">
                Tất cả danh mục <span className="text-gray-400 font-medium text-base">({pagination.total || categories.length})</span>
              </h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Input.Search
                placeholder="Tìm kiếm danh mục..."
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) handleSearch("");
                }}
                style={{ width: 250 }}
                className="rounded-xl"
                allowClear
                prefix={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
              />
              <Button icon={<i className="fa-solid fa-rotate-right mr-1" />} onClick={() => fetchCategories()}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-plus text-black"></i>}
                className="shadow-lg shadow-yellow-200/50"
                onClick={handleAddCategory}
              >
                {t("categories.addNew") || "Thêm danh mục mới"}
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={categories}
            loading={isListLoading}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
          />
        </div>
      </div>

      {/* Drawer: Thêm / Sửa Danh mục */}
      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-folder text-black"></i>
            {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </span>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={520}
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
              name="name"
              label="Mã định danh (Slug)"
              rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
              extra="Chữ thường, không dấu, không khoảng trắng (Ví dụ: restaurant, hotel, cafe)"
            >
              <Input placeholder="e.g., restaurant" />
            </Form.Item>

            <Form.Item
              name="display_name"
              label="Tên hiển thị"
              rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
              extra="Tên danh mục hiển thị tới người dùng trên giao diện"
            >
              <Input placeholder="e.g., Nhà hàng & Ẩm thực" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả chi tiết"
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả ngắn gọn về danh mục..."
              />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  );
}
