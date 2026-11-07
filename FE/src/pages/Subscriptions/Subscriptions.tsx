"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Table,
    Tag,
    Modal,
    Spin,
    message,
    Card,
    Space,
    Popconfirm,
    Input,
    Select,
    Avatar,
    Statistic,
    Row,
    Col,
    Drawer,
    Descriptions,
    Timeline,
} from "antd";
import {
    UserOutlined,
    ReloadOutlined,
    SearchOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    AppleOutlined,
    AndroidOutlined,
    DollarOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useSubscriptionStore from "../../stores/subscriptionStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useLanguageStore from "../../stores/languageStore.ts";

dayjs.extend(relativeTime);

interface Subscription {
    id: number;
    user_id: number;
    revenuecat_customer_id: string;
    product_id: string;
    product_name: string;
    status: "active" | "cancelled" | "expired";
    platform: "ios" | "android";
    expires_at: string;
    days_remaining: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        username: string;
        email: string;
        name: string;
        avatar: string | null;
        is_premium: boolean;
    };
}

export default function Subscriptions() {
    const { t } = useLanguageStore();
    const {
        subscriptions,
        stats,
        pagination,
        filters,
        isLoading,
        isLoadingStats,
        isCancelling,
        fetchSubscriptions,
        fetchStats,
        fetchUserHistory,
        cancelSubscription,
        setFilters,
        clearFilters,
        setPageSize,
    } = useSubscriptionStore();

    const [searchText, setSearchText] = useState("");
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [userHistory, setUserHistory] = useState<any>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Load data on mount
    useEffect(() => {
        fetchSubscriptions(1);
        fetchStats();
    }, []);

    // Reload on filter changes
    useEffect(() => {
        fetchSubscriptions(1);
    }, [filters]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        fetchSubscriptions(pagination.current || 1);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setFilters({ search: value });
    };

    const handleViewHistory = async (subscription: Subscription) => {
        setIsHistoryDrawerOpen(true);
        setIsHistoryLoading(true);
        setSelectedSubscription(subscription);

        try {
            const history = await fetchUserHistory(subscription.user_id);
            setUserHistory(history);
        } catch (error) {
            message.error("Failed to load subscription history");
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleCancelSubscription = async (subscriptionId: number) => {
        const result = await cancelSubscription(subscriptionId);
        if (result) {
            // Refresh history if viewing the cancelled subscription
            if (selectedSubscription?.id === subscriptionId) {
                const history = await fetchUserHistory(selectedSubscription.user_id);
                setUserHistory(history);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "green";
            case "cancelled":
                return "orange";
            case "expired":
                return "red";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircleOutlined />;
            case "cancelled":
                return <CloseCircleOutlined />;
            case "expired":
                return <ClockCircleOutlined />;
            default:
                return null;
        }
    };

    const getPlatformIcon = (platform: string) => {
        return platform === "ios" ? <AppleOutlined /> : <AndroidOutlined />;
    };

    const columns: ColumnsType<Subscription> = [
        {
            title: (
                <span className="flex items-center gap-2">
                    <UserOutlined />
                    <span className="font-semibold">User</span>
                </span>
            ),
            key: "user",
            width: 280,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={record.user.avatar}
                        icon={<UserOutlined />}
                        size={48}
                        className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                            {record.user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {record.user.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">@{record.user.username}</span>
                            {record.user.is_premium && (
                                <Tag color="gold" className="text-xs">
                                    Premium
                                </Tag>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-box"></i>
                    <span className="font-semibold">Product</span>
                </span>
            ),
            key: "product",
            render: (_, record) => (
                <div>
                    <div className="font-semibold text-gray-900">{record.product_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{record.product_id}</div>
                    <Space size="small" className="mt-2">
                        <Tag icon={getPlatformIcon(record.platform)} color={record.platform === "ios" ? "blue" : "green"}>
                            {record.platform.toUpperCase()}
                        </Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check"></i>
                    <span className="font-semibold">Status</span>
                </span>
            ),
            key: "status",
            width: 140,
            render: (_, record) => (
                <Tag
                    icon={getStatusIcon(record.status)}
                    color={getStatusColor(record.status)}
                    className="font-semibold uppercase"
                >
                    {record.status}
                </Tag>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar"></i>
                    <span className="font-semibold">Expires</span>
                </span>
            ),
            key: "expires",
            render: (_, record) => {
                const expiresAt = dayjs(record.expires_at);
                const isExpiringSoon = record.days_remaining > 0 && record.days_remaining <= 7;

                return (
                    <div>
                        <div className="text-sm text-gray-900">
                            {expiresAt.format("MMM DD, YYYY")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {expiresAt.format("HH:mm")}
                        </div>
                        {record.status === "active" && (
                            <div
                                className={`text-xs mt-1 font-semibold ${isExpiringSoon ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                {record.days_remaining} days left
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-clock"></i>
                    <span className="font-semibold">Created</span>
                </span>
            ),
            key: "created",
            render: (_, record) => (
                <div>
                    <div className="text-sm text-gray-900">
                        {dayjs(record.created_at).format("MMM DD, YYYY")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {dayjs(record.created_at).fromNow()}
                    </div>
                </div>
            ),
        },
        {
            title: <span className="font-semibold">Actions</span>,
            key: "action",
            align: "center",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<i className="fa-solid fa-history"></i>}
                        onClick={() => handleViewHistory(record)}
                    >
                        History
                    </Button>
                    {record.status === "active" && (
                        <Popconfirm
                            title="Cancel Subscription?"
                            description={
                                <div className="max-w-xs">
                                    <p>This will cancel the subscription in the database.</p>
                                    <p className="text-red-600 font-semibold mt-2">
                                        ⚠️ You must also cancel in RevenueCat!
                                    </p>
                                </div>
                            }
                            onConfirm={() => handleCancelSubscription(record.id)}
                            okText="Cancel Subscription"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                loading={isCancelling}
                            >
                                Cancel
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const paginationConfig = {
        current: pagination.current_page,
        pageSize: pagination.per_page,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total: number, range: [number, number]) =>
            t("common.loading") === "Đang tải..."
                ? `${range[0]}-${range[1]} của ${total} gói đăng ký`
                : `${range[0]}-${range[1]} of ${total} subscriptions`,
        pageSizeOptions: ["10", "30", "50", "100"],
    };

    return (
        <>
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                    <span>{t("common.home") || "Home"}</span>
                    <span>/</span>
                    <span className="text-black">{t("navigation.subscriptions")}</span>
                </div>
                <h1 className="text-3xl font-bold text-black">{t("subscriptions.title")}</h1>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title={t("subscriptions.totalSubscriptions")}
                                value={stats.overview.total_subscriptions}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: "#1890ff" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title={t("subscriptions.active")}
                                value={stats.overview.active}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title={t("subscriptions.cancelled")}
                                value={stats.overview.cancelled}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: "#fa8c16" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title={t("subscriptions.churnRate")}
                                value={stats.metrics.churn_rate}
                                suffix="%"
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: "#f5222d" }}
                                precision={1}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title="iOS Subscriptions"
                                value={stats.platform_breakdown.ios}
                                prefix={<AppleOutlined />}
                                valueStyle={{ color: "#000" }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="rounded-2xl shadow-soft border border-gray-100">
                            <Statistic
                                title="Android Subscriptions"
                                value={stats.platform_breakdown.android}
                                prefix={<AndroidOutlined />}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-6">
                    {/* Filters */}
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    fetchSubscriptions(pagination.current_page);
                                    fetchStats();
                                }}
                                loading={isLoading || isLoadingStats}
                            >
                                Refresh
                            </Button>
                            <Button onClick={clearFilters}>Clear Filters</Button>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <Input.Search
                                placeholder="Search by email, username, or name..."
                                onSearch={handleSearch}
                                style={{ width: 300 }}
                                className="rounded-xl"
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                            {/* Status filter */}
                            <Select
                                placeholder="Status"
                                style={{ width: 150 }}
                                value={filters.status}
                                onChange={(value) => setFilters({ status: value })}
                                allowClear
                            >
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="cancelled">Cancelled</Select.Option>
                                <Select.Option value="expired">Expired</Select.Option>
                            </Select>
                            {/* Platform filter */}
                            <Select
                                placeholder="Platform"
                                style={{ width: 150 }}
                                value={filters.platform}
                                onChange={(value) => setFilters({ platform: value })}
                                allowClear
                            >
                                <Select.Option value="ios">
                                    <Space>
                                        <AppleOutlined />
                                        iOS
                                    </Space>
                                </Select.Option>
                                <Select.Option value="android">
                                    <Space>
                                        <AndroidOutlined />
                                        Android
                                    </Space>
                                </Select.Option>
                            </Select>
                            {/* Sort */}
                            <Select
                                placeholder="Sort By"
                                style={{ width: 180 }}
                                value={`${filters.sort_by}_${filters.sort_order}`}
                                onChange={(value) => {
                                    const [sort_by, sort_order] = value.split("_");
                                    setFilters({ sort_by, sort_order });
                                }}
                            >
                                <Select.Option value="created_at_desc">Newest First</Select.Option>
                                <Select.Option value="created_at_asc">Oldest First</Select.Option>
                                <Select.Option value="expires_at_asc">Expiring Soon</Select.Option>
                                <Select.Option value="expires_at_desc">Expiring Last</Select.Option>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={subscriptions}
                        loading={isLoading}
                        rowKey="id"
                        pagination={paginationConfig}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                    />
                </div>
            </div>

            {/* User History Drawer */}
            <Drawer
                title={
                    selectedSubscription ? (
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={selectedSubscription.user.avatar}
                                icon={<UserOutlined />}
                                size={40}
                            />
                            <div>
                                <div className="font-semibold">{selectedSubscription.user.name}</div>
                                <div className="text-xs text-gray-500">{selectedSubscription.user.email}</div>
                            </div>
                        </div>
                    ) : "Subscription History"
                }
                placement="right"
                open={isHistoryDrawerOpen}
                onClose={() => setIsHistoryDrawerOpen(false)}
                width={600}
            >
                {isHistoryLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spin size="large" />
                    </div>
                ) : userHistory ? (
                    <div>
                        {/* User Info */}
                        <Card className="mb-6 rounded-2xl">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Username">
                                    @{userHistory.user.username}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {userHistory.user.email}
                                </Descriptions.Item>
                                <Descriptions.Item label="Premium Status">
                                    {userHistory.user.is_premium ? (
                                        <Tag color="gold">Active Premium</Tag>
                                    ) : (
                                        <Tag color="default">Not Premium</Tag>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Subscription History Timeline */}
                        <h3 className="text-lg font-semibold mb-4">Subscription History</h3>
                        <Timeline>
                            {userHistory.subscriptions.map((sub: Subscription) => (
                                <Timeline.Item
                                    key={sub.id}
                                    color={getStatusColor(sub.status)}
                                    dot={getStatusIcon(sub.status)}
                                >
                                    <Card size="small" className="mb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold">{sub.product_name}</div>
                                                <Space size="small" className="mt-2">
                                                    <Tag
                                                        icon={getPlatformIcon(sub.platform)}
                                                        color={sub.platform === "ios" ? "blue" : "green"}
                                                    >
                                                        {sub.platform.toUpperCase()}
                                                    </Tag>
                                                    <Tag
                                                        icon={getStatusIcon(sub.status)}
                                                        color={getStatusColor(sub.status)}
                                                    >
                                                        {sub.status}
                                                    </Tag>
                                                </Space>
                                                <div className="text-xs text-gray-500 mt-3">
                                                    <div>
                                                        Created: {dayjs(sub.created_at).format("MMM DD, YYYY HH:mm")}
                                                    </div>
                                                    <div>
                                                        Expires: {dayjs(sub.expires_at).format("MMM DD, YYYY HH:mm")}
                                                    </div>
                                                    {sub.status === "active" && (
                                                        <div className="font-semibold text-green-600 mt-1">
                                                            {sub.days_remaining} days remaining
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-12">
                        No history available
                    </div>
                )}
            </Drawer>
        </>
    );
}
