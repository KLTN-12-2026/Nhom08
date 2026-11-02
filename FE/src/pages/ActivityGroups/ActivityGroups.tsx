"use client";

import { useState } from "react";
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
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useLanguageStore from "../../stores/languageStore.ts";

export interface Category {
  id: number;
  name: string;
  display_name: string;
  display_order?: number;
}

export interface ActivityGroup {
  id: number;
  key: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  categories?: Category[];
}

// Danh mục mẫu để liên kết
const SAMPLE_CATEGORIES = [
  { value: 1, label: "Quán cà phê & Trà sữa (cafe)" },
  { value: 2, label: "Ẩm thực & Nhà hàng (restaurant)" },
  { value: 3, label: "Điểm tham quan & Check-in (sightseeing)" },
  { value: 4, label: "Giải trí & Hoạt động (entertainment)" },
  { value: 5, label: "Khách sạn & Homestay (hotel)" },
  { value: 6, label: "Mua sắm & Quà lưu niệm (shopping)" },
];

// Dữ liệu mẫu (Mock data) chỉ phục vụ demo UI báo cáo
const INITIAL_GROUPS: ActivityGroup[] = [
  {
    id: 1,
    key: "food_drink",
    name: "Ăn uống & Cà phê",
    description: "Khám phá ẩm thực đường phố, nhà hàng lãng mạn, các quán cafe view đẹp.",
    display_order: 1,
    is_active: true,
    categories: [
      { id: 1, name: "cafe", display_name: "Quán cà phê & Trà sữa", display_order: 1 },
      { id: 2, name: "restaurant", display_name: "Ẩm thực & Nhà hàng", display_order: 2 },
    ],
  },
  {
    id: 2,
    key: "sightseeing_outdoor",
    name: "Tham quan & Trải nghiệm",
    description: "Địa điểm check-in sống ảo, di tích lịch sử và các hoạt động ngoài trời.",
    display_order: 2,
    is_active: true,
    categories: [
      { id: 3, name: "sightseeing", display_name: "Điểm tham quan & Check-in", display_order: 1 },
    ],
  },
  {
    id: 3,
    key: "entertainment_fun",
    name: "Vui chơi & Giải trí",
    description: "Khu vui chơi tổng hợp, rạp chiếu phim, board game, bowling cho nhóm bạn và cặp đôi.",
    display_order: 3,
    is_active: true,
    categories: [
      { id: 4, name: "entertainment", display_name: "Giải trí & Hoạt động", display_order: 1 },
    ],
  },
  {
    id: 4,
    key: "staycation",
    name: "Nghỉ dưỡng & Cuối tuần",
    description: "Khách sạn nghỉ ngơi, homestay ngoại ô yên tĩnh để thư giãn xả stress.",
    display_order: 4,
    is_active: true,
    categories: [
      { id: 5, name: "hotel", display_name: "Khách sạn & Homestay", display_order: 1 },
    ],
  },
  {
    id: 5,
    key: "shopping_nightlife",
    name: "Mua sắm & Chợ đêm",
    description: "Khám phá các khu chợ đêm sôi động, phố đi bộ và trung tâm thương mại.",
    display_order: 5,
    is_active: false,
    categories: [
      { id: 6, name: "shopping", display_name: "Mua sắm & Quà lưu niệm", display_order: 1 },
    ],
  },
];

export default function ActivityGroups() {
  const { t } = useLanguageStore();

  const [groupsList, setGroupsList] = useState<ActivityGroup[]>(INITIAL_GROUPS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ActivityGroup | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const handleAddGroup = () => {
    setIsEditMode(false);
    setEditingGroup(null);
    form.resetFields();
    form.setFieldsValue({
      display_order: groupsList.length + 1,
      is_active: true,
      categories: [{ category_id: 1, display_order: 1 }],
    });
    setIsDrawerOpen(true);
  };

  const handleEditGroup = (record: ActivityGroup) => {
    setIsEditMode(true);
    setEditingGroup(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      categories:
        record.categories?.map((c) => ({
          category_id: c.id,
          display_order: c.display_order || 0,
        })) || [],
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteGroup = (id: number) => {
    setGroupsList((prev) => prev.filter((item) => item.id !== id));
    message.success("Đã xóa nhóm hoạt động thành công");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Transform categories mapping for mock view
      const mappedCats: Category[] = (values.categories || []).map((catItem: any) => {
        const found = SAMPLE_CATEGORIES.find((c) => c.value === catItem.category_id);
        return {
          id: catItem.category_id,
          name: found ? found.label.split("(")[1].replace(")", "") : "cat",
          display_name: found ? found.label.split(" (")[0] : "Danh mục",
          display_order: catItem.display_order,
        };
      });

      if (isEditMode && editingGroup) {
        setGroupsList((prev) =>
          prev.map((item) =>
            item.id === editingGroup.id
              ? {
                  ...item,
                  ...values,
                  categories: mappedCats,
                }
              : item
          )
        );
        message.success("Cập nhật nhóm hoạt động thành công");
      } else {
        const newGroup: ActivityGroup = {
          id: Date.now(),
          ...values,
          categories: mappedCats,
        };
        setGroupsList((prev) => [newGroup, ...prev]);
        message.success("Thêm nhóm hoạt động mới thành công");
      }

      setIsDrawerOpen(false);
    } catch {
      // Validate error
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
                  {c.display_name}
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
            onClick={() => handleEditGroup(record)}
          />
          <Popconfirm
            title="Xóa nhóm hoạt động này?"
            description="Bạn có chắc muốn xóa nhóm hoạt động này?"
            onConfirm={() => handleDeleteGroup(record.id)}
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
    total: groupsList.length,
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
                Tất cả nhóm hoạt động <span className="text-gray-400 font-medium text-base">({groupsList.length})</span>
              </h3>
            </div>
            <Button
              type="primary"
              icon={<i className="fa-solid fa-plus text-black"></i>}
              className="shadow-lg shadow-yellow-200/50"
              onClick={handleAddGroup}
            >
              {t("activityGroups.addNew") || "Thêm nhóm hoạt động"}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={groupsList}
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
            <Button type="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="pt-4">
          <Form.Item
            name="key"
            label="Mã nhóm (Key)"
            rules={[{ required: true, message: "Vui lòng nhập từ khóa định danh" }]}
            extra="Chữ thường không dấu, dùng cho hệ thống nhận diện (ví dụ: food_drink, entertainment)"
          >
            <Input placeholder="e.g., food_drink" />
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
                          optionFilterProp="label"
                          options={SAMPLE_CATEGORIES}
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
      </Drawer>
    </>
  );
}

