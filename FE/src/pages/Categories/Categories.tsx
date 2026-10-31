"use client";

import { useState } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;

export interface Category {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Dữ liệu mẫu (Mock data) chỉ phục vụ demo UI báo cáo
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "cafe",
    display_name: "Quán cà phê & Trà sữa",
    description: "Các địa điểm cafe ngắm cảnh, cafe làm việc, acoustic và trà sữa giới trẻ yêu thích.",
  },
  {
    id: 2,
    name: "restaurant",
    display_name: "Ẩm thực & Nhà hàng",
    description: "Nhà hàng ẩm thực vùng miền, buffet, lẩu nướng, món ăn vặt đường phố đặc sắc.",
  },
  {
    id: 3,
    name: "sightseeing",
    display_name: "Điểm tham quan & Check-in",
    description: "Danh lam thắng cảnh, di tích lịch sử, bảo tàng và các góc check-in sống ảo cực hot.",
  },
  {
    id: 4,
    name: "entertainment",
    display_name: "Giải trí & Hoạt động",
    description: "Khu vui chơi giải trí, rạp chiếu phim, bowling, boardgame, workshop trải nghiệm.",
  },
  {
    id: 5,
    name: "hotel",
    display_name: "Khách sạn & Homestay",
    description: "Nơi lưu trú nghỉ dưỡng, khách sạn tiện nghi và homestay ấm cúng cho du khách.",
  },
  {
    id: 6,
    name: "shopping",
    display_name: "Mua sắm & Quà lưu niệm",
    description: "Trung tâm thương mại, chợ đêm, các cửa hàng đặc sản làm quà tặng.",
  },
];

export default function Categories() {
  const { t } = useLanguageStore();

  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [form] = Form.useForm();

  // Lọc tìm kiếm theo tên hoặc tên hiển thị
  const filteredCategories = categoriesList.filter((item) => {
    if (!searchText) return true;
    const term = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.display_name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleSearch = (value: string) => {
    setSearchText(value.trim());
    setCurrentPage(1);
  };

  const handleAddCategory = () => {
    setIsEditMode(false);
    setEditingCategory(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEditCategory = (record: Category) => {
    setIsEditMode(true);
    setEditingCategory(record);
    form.resetFields();
    form.setFieldsValue(record);
    setIsDrawerOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    setCategoriesList((prev) => prev.filter((item) => item.id !== id));
    message.success("Đã xóa danh mục thành công");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && editingCategory) {
        setCategoriesList((prev) =>
          prev.map((item) =>
            item.id === editingCategory.id ? { ...item, ...values } : item
          )
        );
        message.success("Cập nhật danh mục thành công");
      } else {
        const newCat: Category = {
          id: Date.now(),
          ...values,
        };
        setCategoriesList((prev) => [newCat, ...prev]);
        message.success("Thêm danh mục mới thành công");
      }

      setIsDrawerOpen(false);
    } catch {
      // Validate error
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
            onClick={() => handleEditCategory(record)}
          />
          <Popconfirm
            title="Xóa danh mục này?"
            description="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Xóa"
            okButtonProps={{ danger: true }}
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
    total: filteredCategories.length,
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
                Tất cả danh mục <span className="text-gray-400 font-medium text-base">({categoriesList.length})</span>
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
            dataSource={filteredCategories}
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
            <Button type="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
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
      </Drawer>
    </>
  );
}

