"use client";

import { useEffect } from "react";
import { Card, Spin, Row, Col, Statistic } from "antd";
import useDashboardStore from "./DashboardStore.ts";
import useStatisticsStore from "../Statistics/StatisticsStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";

export default function Dashboard() {
    const { dashboardData, getDashboardData, isLoading: isDashboardLoading } = useDashboardStore();
    const {
        usersStats,
        placesStats,
        transactionsStats,
        generalStats,
        getUsersStats,
        getPlacesStats,
        getTransactionsStats,
        getGeneralStats,
        isLoading: isStatsLoading
    } = useStatisticsStore();
    const { t } = useLanguageStore();

    useEffect(() => {
        getDashboardData();
        getUsersStats();
        getPlacesStats();
        getTransactionsStats();
        getGeneralStats();
    }, []);

    const isLoading = isDashboardLoading || isStatsLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip={t("common.loading")} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black">{t("dashboard.title")}</h1>
                <p className="text-gray-500">{t("dashboard.welcomeBack")}</p>
            </div>

            {/* General Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-soft rounded-3xl border-none bg-gradient-to-br from-yellow-100 to-yellow-50">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">{t("dashboard.totalUsers")}</span>}
                            value={usersStats?.total_users || 0}
                            prefix={<i className="fa-solid fa-users text-primary-600 mr-2"></i>}
                            valueStyle={{ fontWeight: "bold", color: "#1f2937" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-soft rounded-3xl border-none bg-gradient-to-br from-blue-100 to-blue-50">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">{t("dashboard.totalPlaces")}</span>}
                            value={placesStats?.total_places || 0}
                            prefix={<i className="fa-solid fa-location-dot text-blue-600 mr-2"></i>}
                            valueStyle={{ fontWeight: "bold", color: "#1f2937" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-soft rounded-3xl border-none bg-gradient-to-br from-green-100 to-green-50">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">{t("dashboard.transactions")}</span>}
                            value={transactionsStats?.total_transactions || 0}
                            prefix={<i className="fa-solid fa-money-bill-wave text-green-600 mr-2"></i>}
                            valueStyle={{ fontWeight: "bold", color: "#1f2937" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-soft rounded-3xl border-none bg-gradient-to-br from-purple-100 to-purple-50">
                        <Statistic
                            title={<span className="text-gray-600 font-medium">{t("dashboard.activeGroups")}</span>}
                            value={generalStats?.active_groups || 0}
                            prefix={<i className="fa-solid fa-layer-group text-purple-600 mr-2"></i>}
                            valueStyle={{ fontWeight: "bold", color: "#1f2937" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Detailed Stats Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth / Details */}
                <Card className="shadow-soft rounded-3xl border-gray-100" title={<span className="font-bold text-lg">{t("dashboard.userStatistics")}</span>}>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.newUsersToday")}</span>
                            <span className="font-bold text-black">{usersStats?.new_users_today || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.activeUsers")}</span>
                            <span className="font-bold text-green-600">{usersStats?.active_users || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.blockedUsers")}</span>
                            <span className="font-bold text-red-600">{usersStats?.blocked_users || 0}</span>
                        </div>
                    </div>
                </Card>

                {/* Place Stats */}
                <Card className="shadow-soft rounded-3xl border-gray-100" title={<span className="font-bold text-lg">{t("dashboard.placeStatistics")}</span>}>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.pendingApproval")}</span>
                            <span className="font-bold text-orange-500">{placesStats?.pending_places || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.topRated")}</span>
                            <span className="font-bold text-yellow-600">{placesStats?.top_rated_count || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">{t("dashboard.reported")}</span>
                            <span className="font-bold text-red-600">{placesStats?.reported_places || 0}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
