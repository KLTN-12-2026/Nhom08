"use client";

import { useNavigate } from "react-router-dom";
import useDataMainStore from "../../stores/dataMainStore";
import useLanguageStore from "../../stores/languageStore.ts";

export default function AdminHome() {
  const navigate = useNavigate();
  const { user } = useDataMainStore();
  const { t } = useLanguageStore();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? t("home.admin.goodMorning")
      : hour < 18
      ? t("home.admin.goodAfternoon")
      : t("home.admin.goodEvening");

  const quickActions = [
    {
      key: "statistics",
      title: t("home.admin.statistics"),
      description: t("home.admin.statisticsDesc"),
      icon: "fa-chart-line",
      color: "#FFCB37",
      bg: "from-yellow-400/20 to-yellow-300/10",
      border: "border-yellow-400/30",
      path: "/admin/statistics",
    },
    {
      key: "users",
      title: t("home.admin.users"),
      description: t("home.admin.usersDesc"),
      icon: "fa-users",
      color: "#60a5fa",
      bg: "from-blue-400/20 to-blue-300/10",
      border: "border-blue-400/30",
      path: "/admin/users",
    },
    {
      key: "places",
      title: t("home.admin.places"),
      description: t("home.admin.placesDesc"),
      icon: "fa-map-location-dot",
      color: "#34d399",
      bg: "from-emerald-400/20 to-emerald-300/10",
      border: "border-emerald-400/30",
      path: "/admin/places",
    },
    {
      key: "tickets",
      title: t("home.admin.tickets"),
      description: t("home.admin.ticketsDesc"),
      icon: "fa-comments",
      color: "#f472b6",
      bg: "from-pink-400/20 to-pink-300/10",
      border: "border-pink-400/30",
      path: "/admin/support",
    },
    {
      key: "notifications",
      title: t("home.admin.notifications"),
      description: t("home.admin.notificationsDesc"),
      icon: "fa-bell",
      color: "#a78bfa",
      bg: "from-violet-400/20 to-violet-300/10",
      border: "border-violet-400/30",
      path: "/admin/notifications",
    },
    {
      key: "settings",
      title: t("home.admin.settings"),
      description: t("home.admin.settingsDesc"),
      icon: "fa-gear",
      color: "#94a3b8",
      bg: "from-slate-400/20 to-slate-300/10",
      border: "border-slate-400/30",
      path: "/admin/settings",
    },
  ];

  const recentLinks = [
    { label: t("navigation.users"), path: "/admin/users", icon: "fa-users" },
    { label: t("navigation.places"), path: "/admin/places", icon: "fa-map-location-dot" },
    { label: t("navigation.cashflow"), path: "/admin/cashflow", icon: "fa-money-bill-trend-up" },
    { label: t("navigation.subscriptions"), path: "/admin/subscriptions", icon: "fa-credit-card" },
    { label: t("navigation.quotes"), path: "/admin/quotes", icon: "fa-quote-left" },
  ];

  return (
    <div className="min-h-full space-y-8">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FFCB37, transparent)" }}
        />
        <div
          className="absolute -bottom-20 left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #60a5fa, transparent)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-2">
              {greeting}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {user?.name || "Quản trị viên"} 👋
            </h1>
            <p className="mt-2 text-gray-400 text-base max-w-lg">
              {t("home.admin.subtitle")}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/admin/statistics")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-black text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #FFCB37, #FFE27A)" }}
            >
              <i className="fa-solid fa-chart-line"></i>
              {t("navigation.statistics")}
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-white text-sm border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20"
            >
              <i className="fa-solid fa-users"></i>
              {t("navigation.users")}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("home.admin.quickActions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.key}
              onClick={() => navigate(action.path)}
              className={`group text-left p-5 rounded-2xl border bg-gradient-to-br ${action.bg} ${action.border} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:border-opacity-20 backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.color + "22" }}
                >
                  <i
                    className={`fa-solid ${action.icon} text-lg`}
                    style={{ color: action.color }}
                  ></i>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-base group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
                  {action.title}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {action.description}
              </p>
              <div
                className="mt-3 flex items-center gap-1 text-xs font-semibold"
                style={{ color: action.color }}
              >
                {t("home.open")} <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t("home.admin.quickLinks")}
        </h2>
        <div className="flex flex-wrap gap-3">
          {recentLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <i className={`fa-solid ${link.icon} text-xs`}></i>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
