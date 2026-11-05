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
    Space,
    Popconfirm,
    InputNumber,
    DatePicker,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import useAnnouncementsStore, { Announcement } from "./AnnouncementsStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;
const { Option } = Select;

export default function Announcements() {
    const { t } = useLanguageStore();
    const {
        getAnnouncements,
        getAnnouncementById,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        announcementsData,
        announcementData,
        isListLoading,
        isDetailLoading,
        isSaving,
    } = useAnnouncementsStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAnnouncements();
    }, [currentPage, pageSize, searchText, typeFilter, statusFilter]);

    const fetchAnnouncements = () => {
        const params: any = {
            page: currentPage,
            per_page: pageSize,
        };
        if (searchText) {
            params.search = searchText;
        }
        if (typeFilter) {
            params.type = typeFilter;
        }
        if (statusFilter) {
            params.status = statusFilter;
        }
        getAnnouncements(params);
    };

    const handleTableChange = (pagination: TablePaginationConfig) => {
        setCurrentPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 10);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleAddAnnouncement = () => {
        setIsEditMode(false);
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({
            type: "banner",
            position: "home",
            status: "active",
            priority: 0,
        });
        setIsDrawerOpen(true);
    };

    const handleEditAnnouncement = async (id: number) => {
        setIsEditMode(true);
        setEditingId(id);
        setIsDrawerOpen(true);
        form.resetFields();
        const result = await getAnnouncementById(id);
        if (result.success && result.data) {
            const data = result.data.data;
            form.setFieldsValue({
                ...data,
                start_at: data.start_at ? dayjs(data.start_at) : null,
                end_at: data.end_at ? dayjs(data.end_at) : null,
            });
        } else {
            message.error("Không thể tải thông tin chi tiết");
        }
    };

    const handleDeleteAnnouncement = async (id: number) => {
        const result = await deleteAnnouncement(id);
        if (result.success) {
            message.success("Xóa thông báo thành công");
            fetchAnnouncements();
        } else {
            message.error(result.error || "Xóa thông báo thất bại");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const payload: any = {
                title: values.title,
                content: values.content,
                type: values.type,
                position: values.position || "home",
                status: values.status || "active",
                priority: values.priority || 0,
                start_at: values.start_at ? values.start_at.format("YYYY-MM-DD HH:mm:ss") : null,
                end_at: values.end_at ? values.end_at.format("YYYY-MM-DD HH:mm:ss") : null,
            };

            let result;
            if (isEditMode && editingId) {
                result = await updateAnnouncement(editingId, payload);
            } else {
                result = await createAnnouncement(payload);
            }

            if (result.success) {
                message.success(isEditMode ? "Cập nhật thông báo thành công" : "Tạo thông báo thành công");
                setIsDrawerOpen(false);
                fetchAnnouncements();
            } else {
                message.error(result.error || "Lưu thông báo thất bại");
            }
        } catch (err) {
            console.error("Form validation error:", err);
        }
    };

    const columns: ColumnsType<Announcement> = [
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn text-black dark:text-white"></i>
                    <span className="font-semibold">{t("announcements.titleCol") || "Tiêu đề"}</span>
                </span>
            ),
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{text}</span>
                    <span className="text-xs text-gray-500 line-clamp-2">{record.content}</span>
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-tag text-black dark:text-white"></i>
                    <span className="font-semibold">{t("announcements.type") || "Loại"}</span>
                </span>
            ),
            dataIndex: "type",
            key: "type",
            width: 110,
            render: (type: string) => {
                const colors: Record<string, string> = {
                    banner: "blue",
                    popup: "purple",
                    text: "green",
                };
                return <Tag color={colors[type] || "default"}>{(type || "").toUpperCase()}</Tag>;
            },
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-map-pin text-black dark:text-white"></i>
                    <span className="font-semibold">{t("announcements.position") || "Vị trí"}</span>
                </span>
            ),
            dataIndex: "position",
            key: "position",
            width: 100,
            render: (position: string) => <Tag color="orange">{position}</Tag>,
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-black dark:text-white"></i>
                    <span className="font-semibold">{t("announcements.status") || "Trạng thái"}</span>
                </span>
            ),
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: string) => (
                <Tag color={status === "active" ? "success" : "error"}>
                    {status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Tag>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-star text-black dark:text-white"></i>
                    <span className="font-semibold">{t("announcements.priority") || "Ưu tiên"}</span>
                </span>
            ),
            dataIndex: "priority",
            key: "priority",
            align: "center",
            width: 100,
            render: (priority: number) => (
                <span className="font-semibold text-amber-500">★ {priority || 0}</span>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar text-black dark:text-white"></i>
                    <span className="font-semibold">
                        {t("announcements.timeRange") || "Thời gian hiệu lực"}
                    </span>
                </span>
            ),
            key: "time_range",
            width: 220,
            render: (_, record) => {
                const start = record.start_at
                    ? dayjs(record.start_at).format("DD/MM/YYYY HH:mm")
                    : "Không giới hạn";
                const end = record.end_at
                    ? dayjs(record.end_at).format("DD/MM/YYYY HH:mm")
                    : "Không giới hạn";
                return (
                    <div className="text-xs text-gray-500 space-y-0.5">
                        <div><span className="text-gray-400">Từ:</span> {start}</div>
                        <div><span className="text-gray-400">Đến:</span> {end}</div>
                    </div>
                );
            },
        },
        {
            title: <span className="font-semibold">{t("common.actions") || "Thao tác"}</span>,
            key: "action",
            align: "center",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<i className="fa-solid fa-pen-to-square"></i>}
                        type="text"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditAnnouncement(record.id)}
                    />
                    <Popconfirm
                        title="Xóa thông báo này?"
                        description="Bạn có chắc chắn muốn xóa thông báo này không?"
                        onConfirm={() => handleDeleteAnnouncement(record.id)}
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

    const listItems = announcementsData?.data || [];
    const totalItems = announcementsData?.total || listItems.length;

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
                        {t("navigation.announcements") || "Thông báo hệ thống"}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t("announcements.title") || "Quản lý Thông báo Banner & Popup"}
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                <i className="fa-solid fa-bullhorn text-lg"></i>
                            </div>
                            <h3 className="text-lg font-bold text-black dark:text-white m-0">
                                Tất cả thông báo ({totalItems})
                            </h3>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input.Search
                                placeholder="Tìm kiếm thông báo..."
                                onSearch={handleSearch}
                                allowClear
                                style={{ width: 240 }}
                                className="rounded-xl"
                            />
                            <Select
                                placeholder="Lọc theo loại"
                                allowClear
                                style={{ width: 140 }}
                                value={typeFilter}
                                onChange={(value) => {
                                    setTypeFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <Option value="banner">Banner</Option>
                                <Option value="popup">Popup</Option>
                                <Option value="text">Text</Option>
                            </Select>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: 160 }}
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value);
                                    setCurrentPage(1);
                                }}
                            >
                                <Option value="active">Đang hoạt động</Option>
                                <Option value="inactive">Ngưng hoạt động</Option>
                            </Select>
                            <Button
                                type="primary"
                                icon={<i className="fa-solid fa-plus mr-1"></i>}
                                onClick={handleAddAnnouncement}
                            >
                                {t("announcements.addNew") || "Tạo thông báo"}
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
                        scroll={{ x: 1000 }}
                    />
                </div>
            </div>

            <Drawer
                title={
                    <span className="flex items-center gap-2 text-lg">
                        <i className="fa-solid fa-bullhorn text-amber-500"></i>
                        {isEditMode ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
                    </span>
                }
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={580}
                destroyOnClose
                footer={
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
                        <Button type="primary" onClick={handleSave} loading={isSaving}>
                            Lưu thông báo
                        </Button>
                    </div>
                }
            >
                {isDetailLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Spin tip="Đang tải dữ liệu..." />
                    </div>
                ) : (
                    <Form form={form} layout="vertical" className="pt-2">
                        <Form.Item
                            name="title"
                            label="Tiêu đề thông báo"
                            rules={[
                                { required: true, message: "Vui lòng nhập tiêu đề" },
                                { max: 255, message: "Tiêu đề không được vượt quá 255 ký tự" },
                            ]}
                        >
                            <Input placeholder="Ví dụ: Chào mừng ngày lễ..." maxLength={255} />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label="Nội dung thông báo"
                            rules={[{ required: true, message: "Vui lòng nhập nội dung thông báo" }]}
                        >
                            <TextArea
                                rows={5}
                                placeholder="Nhập chi tiết nội dung thông báo hiển thị cho người dùng..."
                                showCount
                            />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="type"
                                label="Loại thông báo"
                                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                                initialValue="banner"
                            >
                                <Select placeholder="Chọn loại thông báo">
                                    <Option value="banner">Banner</Option>
                                    <Option value="popup">Popup</Option>
                                    <Option value="text">Text</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="position"
                                label="Vị trí hiển thị"
                                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
                                initialValue="home"
                            >
                                <Select placeholder="Chọn vị trí hiển thị">
                                    <Option value="home">Trang chủ (Home)</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                                initialValue="active"
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Đang hoạt động</Option>
                                    <Option value="inactive">Ngưng hoạt động</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="priority"
                                label="Độ ưu tiên hiển thị"
                                rules={[{ type: "number", min: 0, message: "Độ ưu tiên phải >= 0" }]}
                                initialValue={0}
                            >
                                <InputNumber
                                    min={0}
                                    className="w-full"
                                    placeholder="Càng cao càng ưu tiên (>= 0)"
                                />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="start_at"
                                label="Thời gian bắt đầu"
                                tooltip="Để trống nếu thông báo bắt đầu có hiệu lực ngay"
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    className="w-full"
                                    placeholder="Chọn ngày bắt đầu"
                                />
                            </Form.Item>

                            <Form.Item
                                name="end_at"
                                label="Thời gian kết thúc"
                                tooltip="Để trống nếu không giới hạn ngày kết thúc"
                                dependencies={["start_at"]}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const startAt = getFieldValue("start_at");
                                            if (!value || !startAt) {
                                                return Promise.resolve();
                                            }
                                            if (value.isBefore(startAt)) {
                                                return Promise.reject(
                                                    new Error("Ngày kết thúc phải sau ngày bắt đầu")
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    className="w-full"
                                    placeholder="Chọn ngày kết thúc"
                                />
                            </Form.Item>
                        </div>
                    </Form>
                )}
            </Drawer>
        </>
    );
}
