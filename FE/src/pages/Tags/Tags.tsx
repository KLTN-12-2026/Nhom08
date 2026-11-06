"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Table,
    Tag as AntTag,
    Drawer,
    Form,
    Input,
    Spin,
    message,
    Space,
    Popconfirm,
    Switch,
    Badge,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useTagsStore, { Tag } from "./TagsStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

export default function Tags() {
    const { t } = useLanguageStore();
    const {
        getTags,
        getTagById,
        createTag,
        updateTag,
        deleteTag,
        tagsData,
        tagData,
        isListLoading,
        isDetailLoading,
        isSaving,
    } = useTagsStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTags();
    }, [currentPage, pageSize, searchText]);

    const fetchTags = () => {
        const params: any = {
            page: currentPage,
            per_page: pageSize,
        };
        if (searchText) {
            params.search = searchText;
        }
        getTags(params);
    };

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
        });
        setIsDrawerOpen(true);
    };

    const handleEditTag = async (id: number) => {
        setIsEditMode(true);
        setEditingId(id);
        setIsDrawerOpen(true);
        form.resetFields();
        const result = await getTagById(id);
        if (result.success && result.data) {
            const item = result.data.data;
            form.setFieldsValue({
                name: item.name,
                display: item.display !== undefined ? Boolean(item.display) : (item.is_active ?? true),
            });
        } else {
            message.error(result.error || "Không thể tải chi tiết thẻ");
        }
    };

    const handleDeleteTag = async (id: number) => {
        const result = await deleteTag(id);
        if (result.success) {
            message.success("Đã xóa thẻ thành công");
            fetchTags();
        } else {
            message.error(result.error || "Xóa thẻ thất bại");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            let result;
            if (isEditMode && editingId) {
                result = await updateTag(editingId, {
                    name: values.name.trim().toLowerCase(),
                    display: values.display,
                });
            } else {
                result = await createTag({
                    name: values.name.trim().toLowerCase(),
                    display: values.display,
                });
            }

            if (result.success) {
                message.success(isEditMode ? "Cập nhật thẻ thành công" : "Tạo thẻ mới thành công");
                setIsDrawerOpen(false);
                fetchTags();
            } else {
                message.error(result.error || "Lưu thẻ thất bại");
            }
        } catch (err) {
            console.error("Form validation error:", err);
        }
    };

    const columns: ColumnsType<Tag> = [
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-tag text-black dark:text-white"></i>
                    <span className="font-semibold">{t("tags.name") || "Tên thẻ"}</span>
                </span>
            ),
            key: "tag_info",
            render: (_, record) => {
                const displayName = record.display_name || record.name;
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                                backgroundColor: record.color || "#FEF3C7",
                                border: "2px solid #FFCB37",
                            }}
                        >
                            <i className={record.icon || "fa-solid fa-tag"} style={{ color: "#000" }}></i>
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {displayName}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">#{record.name}</div>
                        </div>
                    </div>
                );
            },
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
            width: 180,
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
                    <span className="font-semibold">{t("tags.status") || "Trạng thái hiển thị"}</span>
                </span>
            ),
            dataIndex: "is_active",
            key: "is_active",
            width: 180,
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
                        onClick={() => handleEditTag(record.id)}
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

    const listItems = tagsData?.data || [];
    const totalItems = tagsData?.total || listItems.length;

    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: totalItems,
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
                                Tất cả thẻ ({totalItems})
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
                        dataSource={listItems}
                        loading={isListLoading}
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
                width={480}
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
                {isDetailLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Spin tip="Đang tải dữ liệu thẻ..." />
                    </div>
                ) : (
                    <Form form={form} layout="vertical" className="pt-2">
                        <Form.Item
                            name="name"
                            label="Tên định danh thẻ (Slug)"
                            rules={[
                                { required: true, message: "Vui lòng nhập tên thẻ" },
                                { max: 100, message: "Tên thẻ không được vượt quá 100 ký tự" },
                            ]}
                            extra="Dùng chữ thường không dấu, không khoảng trắng (Ví dụ: romantic, chill, coffee, outdoor)"
                        >
                            <Input placeholder="romantic" />
                        </Form.Item>

                        <Form.Item
                            name="display"
                            label="Trạng thái hiển thị"
                            valuePropName="checked"
                            extra="Cho phép hiển thị và gắn thẻ này vào các địa điểm"
                        >
                            <Switch defaultChecked />
                        </Form.Item>
                    </Form>
                )}
            </Drawer>
        </>
    );
}
