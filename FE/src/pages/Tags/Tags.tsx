"use client";

import { useState } from "react";
import {
    Button,
    Table,
    Tag as AntTag,
    Drawer,
    Form,
    Input,
    Space,
    Popconfirm,
    Switch,
    Badge,
    message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;

export interface TagItem {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    color?: string;
    icon?: string;
    usage_count?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

const INITIAL_TAGS: TagItem[] = [
    {
        id: 1,
        name: "romantic",
        display_name: "Lãng mạn",
        description: "Không gian riêng tư, ấm cúng, thích hợp cho các buổi hẹn hò của cặp đôi.",
        color: "#FCE7F3",
        icon: "fa-solid fa-heart",
        usage_count: 38,
        is_active: true,
    },
    {
        id: 2,
        name: "chill-view",
        display_name: "View Chill & Hoàng hôn",
        description: "Tầm nhìn trên cao, ngắm hoàng hôn hoặc thành phố về đêm cực đẹp.",
        color: "#FEF3C7",
        icon: "fa-solid fa-mountain-sun",
        usage_count: 54,
        is_active: true,
    },
    {
        id: 3,
        name: "coffee-work",
        display_name: "Cà phê làm việc",
        description: "Yên tĩnh, bàn ghế chuẩn, có nhiều ổ cắm điện và wifi tốc độ cao.",
        color: "#E0E7FF",
        icon: "fa-solid fa-laptop",
        usage_count: 27,
        is_active: true,
    },
    {
        id: 4,
        name: "nightlife",
        display_name: "Chill Bar & Pub",
        description: "Nhạc nhẹ nhàng acoustic hoặc jazz, cocktail sáng tạo.",
        color: "#EDE9FE",
        icon: "fa-solid fa-martini-glass-citrus",
        usage_count: 19,
        is_active: true,
    },
    {
        id: 5,
        name: "outdoor",
        display_name: "Không gian ngoài trời",
        description: "Nhiều cây xanh, thoáng mát, gần gũi với thiên nhiên.",
        color: "#DCFCE7",
        icon: "fa-solid fa-tree",
        usage_count: 42,
        is_active: true,
    },
    {
        id: 6,
        name: "budget-friendly",
        display_name: "Giá cả sinh viên",
        description: "Chi phí vừa phải, đồ uống chất lượng hợp túi tiền.",
        color: "#FFEDD5",
        icon: "fa-solid fa-wallet",
        usage_count: 65,
        is_active: true,
    },
    {
        id: 7,
        name: "pet-friendly",
        display_name: "Thân thiện thú cưng",
        description: "Cho phép mang theo chó mèo hoặc thú cưng vào quán.",
        color: "#F3E8FF",
        icon: "fa-solid fa-paw",
        usage_count: 14,
        is_active: false,
    },
];

export default function Tags() {
    const { t } = useLanguageStore();

    const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [form] = Form.useForm();

    const handleTableChange = (pagination: TablePaginationConfig) => {
        setCurrentPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 10);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleAddTag = () => {
        setIsEditMode(false);
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({
            display: true,
            color: "#FEF3C7",
            icon: "fa-solid fa-tag",
        });
        setIsDrawerOpen(true);
    };

    const handleEditTag = (record: TagItem) => {
        setIsEditMode(true);
        setEditingId(record.id);
        form.resetFields();
        form.setFieldsValue({
            name: record.name,
            display_name: record.display_name,
            description: record.description,
            color: record.color,
            icon: record.icon,
            display: record.is_active,
        });
        setIsDrawerOpen(true);
    };

    const handleDeleteTag = (id: number) => {
        setTags((prev) => prev.filter((item) => item.id !== id));
        message.success("Đã xóa thẻ thành công");
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setIsSaving(true);

            setTimeout(() => {
                if (isEditMode && editingId) {
                    setTags((prev) =>
                        prev.map((t) =>
                            t.id === editingId
                                ? {
                                      ...t,
                                      name: values.name,
                                      display_name: values.display_name || values.name,
                                      description: values.description,
                                      color: values.color || t.color || "#FEF3C7",
                                      icon: values.icon || t.icon || "fa-solid fa-tag",
                                      is_active: values.display !== undefined ? values.display : true,
                                  }
                                : t
                        )
                    );
                    message.success("Cập nhật thẻ thành công");
                } else {
                    const newTag: TagItem = {
                        id: Date.now(),
                        name: values.name,
                        display_name: values.display_name || values.name,
                        description: values.description || "",
                        color: values.color || "#FEF3C7",
                        icon: values.icon || "fa-solid fa-tag",
                        usage_count: 0,
                        is_active: values.display !== undefined ? values.display : true,
                    };
                    setTags((prev) => [newTag, ...prev]);
                    message.success("Tạo thẻ mới thành công");
                }

                setIsSaving(false);
                setIsDrawerOpen(false);
                form.resetFields();
            }, 300);
        } catch {
            setIsSaving(false);
        }
    };

    const filteredTags = tags.filter((item) => {
        if (!searchText) return true;
        const q = searchText.toLowerCase();
        return (
            item.name.toLowerCase().includes(q) ||
            item.display_name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        );
    });

    const columns: ColumnsType<TagItem> = [
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-tag text-black dark:text-white"></i>
                    <span className="font-semibold">{t("tags.name") || "Tên thẻ"}</span>
                </span>
            ),
            key: "tag_info",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                            backgroundColor: record.color || "#FEF3C7",
                            border: "2px solid #FFCB37",
                        }}
                    >
                        {record.icon ? (
                            <i className={`${record.icon} text-lg`} style={{ color: "#000" }}></i>
                        ) : (
                            <i className="fa-solid fa-tag text-amber-600"></i>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {record.display_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">#{record.name}</div>
                    </div>
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-black dark:text-white"></i>
                    <span className="font-semibold">{t("tags.description") || "Mô tả"}</span>
                </span>
            ),
            dataIndex: "description",
            key: "description",
            render: (text) => (
                <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{text || "—"}</span>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-black dark:text-white"></i>
                    <span className="font-semibold">{t("tags.usage") || "Số địa điểm dùng"}</span>
                </span>
            ),
            dataIndex: "usage_count",
            key: "usage_count",
            align: "center",
            width: 160,
            render: (count) => (
                <Badge
                    count={count || 0}
                    showZero
                    style={{ backgroundColor: "#FFCB37", color: "#000", fontWeight: "bold" }}
                />
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-black dark:text-white"></i>
                    <span className="font-semibold">{t("tags.status") || "Trạng thái"}</span>
                </span>
            ),
            dataIndex: "is_active",
            key: "is_active",
            width: 160,
            render: (is_active: boolean) => (
                <AntTag
                    icon={
                        is_active ? (
                            <i className="fa-solid fa-circle-check mr-1"></i>
                        ) : (
                            <i className="fa-solid fa-ban mr-1"></i>
                        )
                    }
                    color={is_active ? "success" : "error"}
                >
                    {is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
                </AntTag>
            ),
        },
        {
            title: <span className="font-semibold">{t("tags.actions") || "Thao tác"}</span>,
            key: "action",
            align: "center",
            width: 130,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<i className="fa-solid fa-pen-to-square"></i>}
                        type="text"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditTag(record)}
                    />
                    <Popconfirm
                        title="Xóa thẻ này?"
                        description="Bạn có chắc muốn xóa thẻ này khỏi hệ thống?"
                        onConfirm={() => handleDeleteTag(record.id)}
                        okText={t("common.yes") || "Có"}
                        cancelText={t("common.no") || "Không"}
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
        total: filteredTags.length,
        showSizeChanger: true,
        showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} thẻ`,
    };

    return (
        <>
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                    <span>{t("common.home") || "Trang chủ"}</span>
                    <span>/</span>
                    <span className="text-black dark:text-white">
                        {t("navigation.tags") || "Quản lý Thẻ/Tag"}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t("tags.title") || "Quản lý Thẻ Khám phá & Gợi ý"}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                <i className="fa-solid fa-tags text-lg"></i>
                            </div>
                            <h3 className="text-lg font-bold text-black dark:text-white m-0">
                                Tất cả thẻ ({filteredTags.length})
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input.Search
                                placeholder="Tìm kiếm thẻ..."
                                onSearch={handleSearch}
                                allowClear
                                style={{ width: 250 }}
                                className="rounded-xl"
                            />
                            <Button
                                type="primary"
                                icon={<i className="fa-solid fa-plus mr-1"></i>}
                                onClick={handleAddTag}
                            >
                                {t("tags.addNew") || "Thêm thẻ mới"}
                            </Button>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={filteredTags}
                        rowKey="id"
                        pagination={paginationConfig}
                        onChange={handleTableChange}
                    />
                </div>
            </div>

            <Drawer
                title={
                    <span className="flex items-center gap-2 text-lg">
                        <i className="fa-solid fa-tag text-amber-500"></i>
                        {isEditMode ? "Chỉnh sửa thẻ" : "Thêm thẻ mới"}
                    </span>
                }
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={520}
                destroyOnClose
                footer={
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
                        <Button type="primary" onClick={handleSave} loading={isSaving}>
                            Lưu thẻ
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical" className="pt-2">
                    <Form.Item
                        name="name"
                        label="Mã định danh thẻ (Slug)"
                        rules={[{ required: true, message: "Vui lòng nhập tên thẻ" }]}
                        extra="Chữ thường, không dấu, ngăn cách bằng gạch nối (Ví dụ: romantic, chill-view, outdoor)"
                    >
                        <Input placeholder="romantic" />
                    </Form.Item>

                    <Form.Item
                        name="display_name"
                        label="Tên hiển thị"
                        rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
                    >
                        <Input placeholder="Ví dụ: Lãng mạn, View Chill..." />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả thẻ">
                        <TextArea rows={3} placeholder="Mô tả ý nghĩa của thẻ hoặc tiêu chí gắn địa điểm..." />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="icon" label="Biểu tượng FontAwesome">
                            <Input placeholder="fa-solid fa-heart" />
                        </Form.Item>

                        <Form.Item name="color" label="Màu nền Badge">
                            <Input placeholder="#FEF3C7" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="display"
                        label="Trạng thái hiển thị"
                        valuePropName="checked"
                        extra="Bật để cho phép gắn thẻ vào địa điểm và hiển thị trên ứng dụng"
                    >
                        <Switch defaultChecked />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
}

