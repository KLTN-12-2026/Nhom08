"use client";

import { useState } from "react";
import { Card, Row, Col, Statistic, DatePicker } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";
import useThemeStore from "../../stores/themeStore.ts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// Mock data số liệu thống kê để báo cáo
const MOCK_USERS_STATS = {
  total_users: 1248,
  new_users_today: 18,
  active_users: 1180,
  blocked_users: 15,
  revenue_by_date: [
    { date: "2026-10-24", total_amount: 1250000 },
    { date: "2026-10-25", total_amount: 2100000 },
    { date: "2026-10-26", total_amount: 1800000 },
    { date: "2026-10-27", total_amount: 3200000 },
    { date: "2026-10-28", total_amount: 2750000 },
    { date: "2026-10-29", total_amount: 3900000 },
    { date: "2026-10-30", total_amount: 4500000 },
  ],
  registrations_by_date: [
    { date: "2026-10-24", count: 12 },
    { date: "2026-10-25", count: 19 },
    { date: "2026-10-26", count: 15 },
    { date: "2026-10-27", count: 28 },
    { date: "2026-10-28", count: 22 },
    { date: "2026-10-29", count: 34 },
    { date: "2026-10-30", count: 18 },
  ],
  users_by_role: [
    { role: "user", count: 1210 },
    { role: "moderator", count: 25 },
    { role: "admin", count: 13 },
  ],
};

const MOCK_PLACES_STATS = {
  total_places: 356,
  pending_places: 12,
  top_rated_count: 85,
  reported_places: 4,
  places_by_date: [
    { date: "2026-10-24", count: 4 },
    { date: "2026-10-25", count: 7 },
    { date: "2026-10-26", count: 5 },
    { date: "2026-10-27", count: 11 },
    { date: "2026-10-28", count: 8 },
    { date: "2026-10-29", count: 14 },
    { date: "2026-10-30", count: 6 },
  ],
  places_by_category: [
    { category_name: "Quán cà phê & Trà sữa", count: 142 },
    { category_name: "Ẩm thực & Nhà hàng", count: 98 },
    { category_name: "Điểm tham quan & Check-in", count: 54 },
    { category_name: "Giải trí & Hoạt động", count: 38 },
    { category_name: "Khách sạn & Homestay", count: 24 },
  ],
  top_places_by_reviews: [
    { id: 1, name: "The Workshop Coffee", reviews_avg_rating: "4.9", reviews_count: 142 },
    { id: 2, name: "Hồ Gươm & Phố Cổ", reviews_avg_rating: "4.8", reviews_count: 128 },
    { id: 3, name: "Pizza 4P's Bến Thành", reviews_avg_rating: "4.8", reviews_count: 115 },
    { id: 4, name: "Bảo tàng Mỹ thuật TP.HCM", reviews_avg_rating: "4.7", reviews_count: 94 },
    { id: 5, name: "Đỉnh Bàn Cờ - Sơn Trà", reviews_avg_rating: "4.7", reviews_count: 86 },
  ],
};

const MOCK_TRANSACTIONS_STATS = {
  total_transactions: 2450,
  transactions_by_date: [
    { date: "2026-10-24", total_points: 120 },
    { date: "2026-10-25", total_points: 240 },
    { date: "2026-10-26", total_points: 190 },
    { date: "2026-10-27", total_points: 380 },
    { date: "2026-10-28", total_points: 290 },
    { date: "2026-10-29", total_points: 450 },
    { date: "2026-10-30", total_points: 310 },
  ],
};

const MOCK_GENERAL_STATS = {
  active_groups: 48,
};

export default function Statistics() {
  const { t } = useLanguageStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  const usersStats = MOCK_USERS_STATS;
  const placesStats = MOCK_PLACES_STATS;
  const transactionsStats = MOCK_TRANSACTIONS_STATS;
  const generalStats = MOCK_GENERAL_STATS;

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {t("statistics.title") || "Thống kê"}
          </h1>
          <p className="text-gray-500">
            {t("statistics.welcomeBack") || "Chào mừng trở lại, Quản trị viên!"}
          </p>
        </div>
        <div>
          <RangePicker
            onChange={handleDateRangeChange}
            className="rounded-xl border-gray-200"
            style={{ height: "42px" }}
          />
        </div>
      </div>

      {/* General Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-soft rounded-3xl border border-gray-100/50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-yellow-50/40 to-white dark:from-yellow-950/20 dark:to-gray-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100/60 dark:bg-yellow-900/40 flex items-center justify-center text-xl text-yellow-600 dark:text-yellow-400">
                <i className="fa-solid fa-users"></i>
              </div>
              <Statistic
                title={
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t("statistics.totalUsers") || "Tổng số người dùng"}
                  </span>
                }
                value={usersStats.total_users}
                valueStyle={{
                  fontWeight: "900",
                  color: isDark ? "#fff" : "#1f2937",
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-soft rounded-3xl border border-gray-100/50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-950/20 dark:to-gray-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/60 dark:bg-blue-900/40 flex items-center justify-center text-xl text-blue-600 dark:text-blue-400">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <Statistic
                title={
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t("statistics.totalPlaces") || "Tổng số địa điểm"}
                  </span>
                }
                value={placesStats.total_places}
                valueStyle={{
                  fontWeight: "900",
                  color: isDark ? "#fff" : "#1f2937",
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-soft rounded-3xl border border-gray-100/50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-green-50/40 to-white dark:from-green-950/20 dark:to-gray-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100/60 dark:bg-green-900/40 flex items-center justify-center text-xl text-green-600 dark:text-green-400">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
              <Statistic
                title={
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t("statistics.transactions") || "Giao dịch"}
                  </span>
                }
                value={transactionsStats.total_transactions}
                valueStyle={{
                  fontWeight: "900",
                  color: isDark ? "#fff" : "#1f2937",
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-soft rounded-3xl border border-gray-100/50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-purple-50/40 to-white dark:from-purple-950/20 dark:to-gray-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/60 dark:bg-purple-900/40 flex items-center justify-center text-xl text-purple-600 dark:text-purple-400">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <Statistic
                title={
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    {t("statistics.activeGroups") || "Nhóm hoạt động"}
                  </span>
                }
                value={generalStats.active_groups}
                valueStyle={{
                  fontWeight: "900",
                  color: isDark ? "#fff" : "#1f2937",
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats */}
        <Card
          className="shadow-soft rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.userStatistics") || "Thống kê người dùng"}
            </span>
          }
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.newUsersToday") || "Người dùng mới (Hôm nay)"}
              </span>
              <span className="font-bold text-black dark:text-white">
                {usersStats.new_users_today}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.activeUsers") || "Người dùng đang hoạt động"}
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {usersStats.active_users}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.blockedUsers") || "Người dùng bị chặn"}
              </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {usersStats.blocked_users}
              </span>
            </div>
          </div>
        </Card>

        {/* Place Stats */}
        <Card
          className="shadow-soft rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.placeStatistics") || "Thống kê địa điểm"}
            </span>
          }
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.pendingApproval") || "Chờ phê duyệt"}
              </span>
              <span className="font-bold text-orange-500 dark:text-orange-400">
                {placesStats.pending_places}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.topRated") || "Đánh giá cao nhất"}
              </span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {placesStats.top_rated_count}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300">
                {t("statistics.reported") || "Báo cáo"}
              </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {placesStats.reported_places}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily Revenue Trend */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 xl:col-span-2"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.dailyRevenueTrend") || "Xu hướng doanh thu hàng ngày"}
            </span>
          }
        >
          <LineChart
            data={usersStats.revenue_by_date.map((d: any) => ({
              date: d.date,
              value: d.total_amount,
            }))}
            color="#ec4899"
            gradId="gradRev"
            noDataText={t("statistics.noData") || "Không có dữ liệu"}
            start={dateRange?.[0] || dayjs("2026-10-24")}
            end={dateRange?.[1] || dayjs("2026-10-30")}
            isCurrency={true}
          />
        </Card>

        {/* User Registrations Trend */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.userRegistrationTrend") || "Xu hướng đăng ký người dùng"}
            </span>
          }
        >
          <LineChart
            data={usersStats.registrations_by_date.map((d: any) => ({
              date: d.date,
              value: d.count,
            }))}
            color="#FFCB37"
            gradId="gradReg"
            noDataText={t("statistics.noData") || "Không có dữ liệu"}
            start={dateRange?.[0] || dayjs("2026-10-24")}
            end={dateRange?.[1] || dayjs("2026-10-30")}
          />
        </Card>

        {/* Places Added Trend */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.placesAddedTrend") || "Xu hướng thêm địa điểm"}
            </span>
          }
        >
          <LineChart
            data={placesStats.places_by_date.map((d: any) => ({
              date: d.date,
              value: d.count,
            }))}
            color="#3b82f6"
            gradId="gradPlaces"
            noDataText={t("statistics.noData") || "Không có dữ liệu"}
            start={dateRange?.[0] || dayjs("2026-10-24")}
            end={dateRange?.[1] || dayjs("2026-10-30")}
          />
        </Card>

        {/* Points Transaction Trend */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.transactionsTrend") || "Xu hướng giao dịch"}
            </span>
          }
        >
          <LineChart
            data={transactionsStats.transactions_by_date.map((d: any) => ({
              date: d.date,
              value: d.total_points,
            }))}
            color="#10b981"
            gradId="gradTx"
            noDataText={t("statistics.noData") || "Không có dữ liệu"}
            start={dateRange?.[0] || dayjs("2026-10-24")}
            end={dateRange?.[1] || dayjs("2026-10-30")}
          />
        </Card>

        {/* Places by Category */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.placesByCategory") || "Địa điểm theo danh mục"}
            </span>
          }
        >
          {(() => {
            const data = placesStats.places_by_category;
            const totalPlaces = data.reduce((acc: number, item: any) => acc + item.count, 0) || 1;
            const sortedData = [...data].sort((a: any, b: any) => b.count - a.count);
            const colors = ["#FFCB37", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#6b7280"];

            return (
              <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                {sortedData.map((item: any, i: number) => {
                  const percentage = Math.round((item.count / totalPlaces) * 100);
                  const color = colors[i % colors.length];
                  return (
                    <div key={item.category_name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.category_name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>

        {/* Users by Role */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.usersByRole") || "Người dùng theo vai trò"}
            </span>
          }
        >
          {(() => {
            const data = usersStats.users_by_role;
            const totalUsers = data.reduce((acc: number, item: any) => acc + item.count, 0) || 1;
            const colors = ["#8b5cf6", "#FFCB37", "#3b82f6", "#10b981"];

            return (
              <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                {data.map((item: any, i: number) => {
                  const percentage = Math.round((item.count / totalUsers) * 100);
                  const color = colors[i % colors.length];
                  return (
                    <div key={item.role} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          {item.role}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>

        {/* Top Reviewed Places */}
        <Card
          className="shadow-soft rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
          title={
            <span className="font-bold text-lg text-gray-800 dark:text-white">
              {t("statistics.topPlaces") || "Địa điểm hàng đầu"}
            </span>
          }
        >
          {(() => {
            const data = placesStats.top_places_by_reviews;

            return (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                {data.map((item: any, i: number) => {
                  const rankColors = [
                    "from-amber-400 to-yellow-500 text-white shadow-yellow-200",
                    "from-slate-300 to-slate-400 text-white shadow-slate-200",
                    "from-amber-600 to-orange-700 text-white shadow-orange-200",
                  ];
                  const defaultColor =
                    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700";
                  const rankClass =
                    i < 3 ? `bg-gradient-to-r ${rankColors[i]} shadow-md` : defaultColor;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${rankClass}`}
                        >
                          {i + 1}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm max-w-[180px] sm:max-w-xs truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-xl text-xs">
                          <i className="fa-solid fa-star text-[10px]"></i>
                          <span>
                            {item.reviews_avg_rating
                              ? Number(item.reviews_avg_rating).toFixed(1)
                              : "5.0"}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          ({item.reviews_count}{" "}
                          {t("statistics.reviewsCount") || "đánh giá"})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}

// ── Reusable Line Chart ──────────────────────────────────────────────────────
interface LineChartProps {
  data: { date: string; value: number }[];
  color: string;
  gradId: string;
  noDataText: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  isCurrency?: boolean;
}

function LineChart({ data, color, gradId, start, end, isCurrency }: LineChartProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const dates = [];
  let curr = start.clone();
  while (curr.isBefore(end) || curr.isSame(end, "day")) {
    dates.push(curr.format("YYYY-MM-DD"));
    curr = curr.add(1, "day");
  }

  const chartData = dates.map((d) => {
    const found = data.find((item: any) => item.date === d);
    return {
      date: d,
      value: found ? Number(found.value) : 0,
    };
  });

  const values = chartData.map((d) => d.value);
  const maxVal = Math.max(...values, 0) * 1.15 || 1;

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, label: d.date, value: d.value };
  });

  let pathD = "";
  let areaD = "";
  if (points.length > 0) {
    pathD =
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ");
    areaD = `${pathD} L ${points[points.length - 1].x} ${
      paddingTop + chartHeight
    } L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-56">
        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={ratio} className="opacity-45">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={isDark ? "#374151" : "#e5e7eb"}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={isDark ? "#9ca3af" : "#6b7280"}
              >
                {isCurrency
                  ? val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : val
                  : val}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (i % Math.ceil(chartData.length / 6) !== 0 && i !== chartData.length - 1)
            return null;
          const dateParts = p.label.split("-");
          const formattedDate =
            dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : p.label;
          return (
            <text
              key={i}
              x={p.x}
              y={paddingTop + chartHeight + 20}
              textAnchor="middle"
              fontSize="10"
              fill={isDark ? "#9ca3af" : "#6b7280"}
            >
              {formattedDate}
            </text>
          );
        })}

        {/* Shaded Area */}
        {areaD && (
          <path
            d={areaD}
            fill={`url(#${gradId})`}
            className="transition-all duration-500"
          />
        )}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
        )}

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={color}
              stroke={isDark ? "#1f2937" : "#fff"}
              strokeWidth="1.5"
              className="transition-all duration-200 group-hover:r-5"
            />
            <title>{`${p.label}: ${
              isCurrency
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(p.value)
                : p.value
            }`}</title>
          </g>
        ))}

        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

