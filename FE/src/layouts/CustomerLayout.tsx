import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Badge, Dropdown, Menu, Tooltip } from "antd";
import type { MenuProps } from "antd";
import useCustomerStore from "../stores/customerStore";
import useLanguageStore from "../stores/languageStore.ts";
import useThemeStore from "../stores/themeStore.ts";
import LanguageSwitcher from "../components/LanguageSwitcher.tsx";
import AIChatbot from "../components/AIChatbot.tsx";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useCustomerStore();
  const { t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent admin from accessing customer layouts and clear session if they are admin
  React.useEffect(() => {
    if (isAuthenticated && user && (user.role === 0 || user.role === "admin")) {
      logout();
      localStorage.removeItem("customer_access_token");
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate, logout]);

  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "account") {
      navigate("/account");
    } else if (e.key === "favorites") {
      navigate("/favorites");
    } else if (e.key === "posts") {
      navigate("/my-posts");
    } else if (e.key === "logout") {
      logout();
      localStorage.removeItem("customer_access_token");
      navigate("/login");
    }
  };

  const userMenuItems: MenuProps["items"] = isAuthenticated ? [
    {
      key: "account",
      label: (
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-user text-gray-700 dark:text-gray-300"></i>
          <span>{t("navigation.profile") || "Hồ sơ của tôi"}</span>
        </div>
      ),
    },
    {
      key: "favorites",
      label: (
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-heart text-gray-700 dark:text-gray-300"></i>
          <span>{t("navigation.favorites") || "Địa điểm yêu thích"}</span>
        </div>
      ),
    },
    {
      key: "posts",
      label: (
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-newspaper text-gray-700 dark:text-gray-300"></i>
          <span>{t("navigation.posts") || "Bài viết của tôi"}</span>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-2 text-red-600">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>{t("auth.logout") || "Đăng xuất"}</span>
        </div>
      ),
      danger: true,
    },
  ] : [
    {
      key: "login",
      label: (
        <div className="flex items-center gap-2" onClick={() => navigate("/login")}>
          <i className="fa-solid fa-right-to-bracket text-gray-700 dark:text-gray-300"></i>
          <span>Đăng nhập</span>
        </div>
      ),
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  // Restructured Dropdown Menus
  const dateMenuItems: MenuProps["items"] = [
    {
      key: "planner",
      label: <Link to="/plans" className="font-semibold">{t("navigation.datePlanner")}</Link>,
      icon: <i className="fa-solid fa-calendar-day text-[#FF9F1C]" />
    },
    {
      key: "spin",
      label: <Link to="/date/spin" className="font-semibold">{t("navigation.dateSpin")}</Link>,
      icon: <i className="fa-solid fa-circle-notch text-[#FFCB37]" />
    }
  ];

  const profileDropdownItems: MenuProps["items"] = [
    {
      key: "account-edit",
      label: <Link to="/account" className="font-semibold">{t("navigation.accountManage")}</Link>,
      icon: <i className="fa-solid fa-user text-blue-500" />
    },
    {
      key: "premium-upgrade",
      label: <Link to="/premium" className="font-semibold">{t("navigation.premiumUpgrade")}</Link>,
      icon: <i className="fa-solid fa-gem text-amber-500" />
    },
    {
      key: "my-posts-list",
      label: <Link to="/my-posts" className="font-semibold">{t("navigation.myPosts")}</Link>,
      icon: <i className="fa-solid fa-newspaper text-green-500" />
    },
    {
      key: "feedback-suggest",
      label: <Link to="/feedback" className="font-semibold">{t("navigation.footerFeedback")}</Link>,
      icon: <i className="fa-solid fa-comment-dots text-purple-500" />
    }
  ];

  const queryParams = new URLSearchParams(location.search);
  const pkg = queryParams.get("package");

  const isDark = theme === "dark";
  let bgClass = isDark ? "bg-gray-950" : "bg-gray-50";

  if (location.pathname === "/premium" || (location.pathname === "/payment" && pkg !== "diamond")) {
    bgClass = isDark
      ? "bg-gradient-to-br from-[#191510] via-[#100D09] to-[#0A0806]"
      : "bg-gradient-to-br from-[#FCFAF6] via-[#F6EEDC] to-[#E9DCB8]";
  } else if (location.pathname === "/payment" && pkg === "diamond") {
    bgClass = isDark
      ? "bg-gradient-to-br from-[#0F181B] via-[#0A1012] to-[#060A0C]"
      : "bg-gradient-to-br from-[#F5F8FA] via-[#E4ECF2] to-[#C9DEEB]";
  }

  return (
    <div className={`customer-layout-wrapper flex flex-col min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans ${bgClass}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#FFF8E7] dark:bg-[#1C1605] border-b border-[#FFE27A] dark:border-[#33290A] h-[73px] flex items-center shadow-sm transition-colors">
        <div className="w-full px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-[#E6B000] bg-clip-text text-transparent font-sans">
              TROVE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                location.pathname === "/"
                  ? "text-[#E6B000]"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#E6B000] hover:bg-amber-50 dark:hover:bg-amber-950/20"
              }`}
            >
              <i className="fa-solid fa-house" />
              <span>{t("common.home")}</span>
            </Link>

            <Link
              to="/location"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/location")
                  ? "text-[#E6B000]"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#E6B000] hover:bg-amber-50 dark:hover:bg-amber-950/20"
              }`}
            >
              <i className="fa-solid fa-map-location-dot" />
              <span>{t("navigation.places")}</span>
            </Link>

            {/* Tạo kế hoạch Dropdown */}
            <Dropdown menu={{ items: dateMenuItems }} trigger={["hover", "click"]}>
              <div
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  isActive("/plans") || isActive("/date/spin")
                    ? "text-[#E6B000]"
                    : "text-gray-700 dark:text-gray-300 hover:text-[#E6B000] hover:bg-amber-50 dark:hover:bg-amber-950/20"
                }`}
              >
                <i className="fa-solid fa-calendar-days" />
                <span>{t("navigation.date")}</span>
                <i className="fa-solid fa-chevron-down text-[10px] opacity-75" />
              </div>
            </Dropdown>

            {/* VIP Link (Direct to Premium - Outstanding Gold Style) */}
            <Link
              to="/premium"
              className={`flex items-center gap-2 py-1.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm border border-[#FFCB37]/50 ${
                isActive("/premium")
                  ? "bg-[#FFCB37] text-black scale-105"
                  : "bg-gradient-to-r from-[#FFCB37]/10 to-[#FF9F1C]/20 text-[#E6B000] hover:from-[#FFCB37] hover:to-[#FF9F1C] hover:text-black hover:scale-105"
              }`}
            >
              <i className="fa-solid fa-crown animate-pulse" />
              <span>{t("navigation.me")}</span>
            </Link>

            <Link
              to="/favorites"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/favorites")
                  ? "text-[#E6B000]"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#E6B000] hover:bg-amber-50 dark:hover:bg-amber-950/20"
              }`}
            >
              <i className="fa-solid fa-heart-circle-check" />
              <span>{t("navigation.favorites")}</span>
            </Link>

            <Link
              to="/feedback"
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/feedback")
                  ? "text-[#E6B000]"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#E6B000] hover:bg-amber-50 dark:hover:bg-amber-950/20"
              }`}
            >
              <i className="fa-solid fa-lightbulb" />
              <span>{t("navigation.footerFeedback")}</span>
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <Tooltip title={t("navigation.notificationsGroup") || "Thông báo"}>
              <Link
                to="/notifications"
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-[#FFE27A]/30 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-750 transition-all duration-200 ${
                  isActive("/notifications") ? "text-[#E6B000]" : ""
                }`}
              >
                <i className="fa-solid fa-bell text-lg" />
              </Link>
            </Tooltip>

            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Tooltip title={theme === "light" ? "Dark Mode" : "Light Mode"}>
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-[#FFE27A]/30 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-gray-750 transition-all duration-200"
              >
                <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"} text-lg`} />
              </button>
            </Tooltip>

            {/* User Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} trigger={["click"]} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full bg-white dark:bg-gray-800 border border-[#FFE27A]/30 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200">
                <Avatar
                  src={user?.avatar || undefined}
                  icon={!user?.avatar && <i className="fa-solid fa-user" />}
                  className="bg-[#FFCB37] text-black font-semibold shadow-sm"
                />
                <span className="hidden md:inline text-xs font-bold text-gray-700 dark:text-gray-200 pr-2">
                  {isAuthenticated ? (user?.name || "User") : "Khách"}
                </span>
              </div>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto transition-all duration-300 flex flex-col justify-start ${
        location.pathname === "/premium" || location.pathname === "/payment"
          ? "px-0 py-0 pb-24"
          : "px-8 py-8 md:pb-8 pb-24"
      }`}>
        {children}
      </main>

      {/* Floating Right Sidebar Drawer */}
      <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-stretch transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-[220px]'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="self-center w-8 h-16 bg-gray-600/80 hover:bg-gray-500/90 backdrop-blur-sm rounded-l-xl flex items-center justify-center text-white shadow-lg transition-all duration-200 shrink-0"
        >
          <i className={`fa-solid fa-chevron-${sidebarOpen ? 'right' : 'left'} text-xs`} />
        </button>

        {/* Sidebar Panel */}
        <div className="w-[220px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl rounded-l-2xl overflow-hidden">
          {/* Sidebar Header */}
          <div className="bg-[#FFCB37] px-5 py-4">
            <span className="text-xl font-black text-black tracking-wider">Trove</span>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-4 space-y-1">
            <Link
              to="/movies"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive('/movies')
                  ? 'bg-[#FFCB37] text-black shadow-md'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <i className="fa-solid fa-film text-lg w-6 text-center" />
              <span>{t('navigation.movies')}</span>
            </Link>

            <Link
              to="/google-maps"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive('/google-maps')
                  ? 'bg-[#FFCB37] text-black shadow-md'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <i className="fa-solid fa-location-crosshairs text-lg w-6 text-center" />
              <span>{t('navigation.googleMaps')}</span>
            </Link>

            <Link
              to="/notifications"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive('/notifications')
                  ? 'bg-[#FFCB37] text-black shadow-md'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <i className="fa-regular fa-bell text-lg w-6 text-center" />
              <span>{t('navigation.notificationsGroup')}</span>
            </Link>

            <Link
              to="/favorites"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive('/favorites')
                  ? 'bg-[#FFCB37] text-black shadow-md'
                  : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <i className="fa-regular fa-heart text-lg w-6 text-center" />
              <span>{t('navigation.favorites')}</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Web Footer — Fully redesigned */}
      <footer className="w-full bg-[#080D1A] border-t border-[#1a2540] mt-auto hidden lg:block text-gray-400 transition-colors">

        {/* Top accent stripe */}
        <div className="w-full h-1" style={{ background: "linear-gradient(90deg, #FFCB37 0%, #FF9F1C 50%, #FFCB37 100%)" }} />



        {/* Main grid */}
        <div className="w-full px-12 py-12 grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-5 pr-6">
            <div>
              <span className="text-3xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-[#E6B000] bg-clip-text text-transparent">
                TROVE
              </span>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Dẫn đường mọi cuộc hẹn</p>
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              {t("navigation.footerDesc")}
            </p>
            {/* Feature highlights — clickable links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "fa-map-location-dot", text: t("navigation.places") || "Địa điểm",   color: "#FFCB37", to: "/location" },
                { icon: "fa-calendar-days",    text: t("navigation.date") || "Tạo kế hoạch", color: "#FF9F1C", to: "/plans" },
                { icon: "fa-shuffle",          text: t("navigation.dateSpin") || "Vòng quay", color: "#60a5fa", to: "/date/spin" },
                { icon: "fa-crown",            text: t("navigation.premiumUpgrade") || "VIP PRO", color: "#a78bfa", to: "/premium" },
              ].map((f) => (
                <Link
                  key={f.to}
                  to={f.to}
                  className="flex items-center gap-2 bg-[#111827] rounded-lg px-3 py-2 border border-[#1a2540] hover:border-amber-400/40 hover:bg-[#1a2540] transition-all duration-200 group"
                >
                  <i className={`fa-solid ${f.icon} text-xs`} style={{ color: f.color }} />
                  <span className="text-xs text-gray-400 font-semibold truncate group-hover:text-white transition-colors">{f.text}</span>
                </Link>
              ))}
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: "fa-facebook-f", href: "#", label: "Facebook" },
                { icon: "fa-instagram",  href: "#", label: "Instagram" },
                { icon: "fa-tiktok",     href: "#", label: "TikTok" },
                { icon: "fa-youtube",    href: "#", label: "YouTube" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-[#111827] border border-[#1a2540] hover:border-amber-400/50 hover:bg-[#FFCB37]/10 flex items-center justify-center text-gray-400 hover:text-[#FFCB37] transition-all duration-200"
                >
                  <i className={`fa-brands ${s.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Explore */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1a2540] pb-2">{t("navigation.home")}</h4>
            <ul className="space-y-3">
              {[
                { to: "/location",        label: t("navigation.places") },
                { to: "/plans",   label: t("navigation.datePlanner") },
                { to: "/date/spin", label: t("navigation.dateSpin") },
                { to: "/favorites", label: t("navigation.favorites") },
                { to: "/whats-new", label: t("navigation.whatsNew") },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 font-medium hover:text-[#FFCB37] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-amber-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1a2540] pb-2">{t("navigation.footerSupport")}</h4>
            <ul className="space-y-3">
              {[
                { to: "/account",  label: t("navigation.accountManage") },
                { to: "/premium",  label: t("navigation.premiumUpgrade") },
                { to: "/feedback", label: t("navigation.footerFeedback") },
                { to: "/support",  label: t("navigation.footerHelpCenter") },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 font-medium hover:text-[#FFCB37] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-amber-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Contact info */}
            <div className="mt-4 space-y-2 pt-3 border-t border-[#1a2540]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <i className="fa-solid fa-envelope text-amber-400" />
                <span>support@trove.app</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <i className="fa-solid fa-clock text-amber-400" />
                <span>8:00 – 22:00 • T2 – CN</span>
              </div>
            </div>
          </div>

          {/* Col 4 & 5: Download */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-b border-[#1a2540] pb-2">{t("navigation.footerMobileApp")}</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {t("navigation.newsletterDesc") || "Tải app để nhận thông báo hẹn hò thời gian thực và trải nghiệm đầy đủ nhất."}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://apps.apple.com/us/app/trove-d%E1%BA%ABn-%C4%91%C6%B0%E1%BB%9Dng-m%E1%BB%8Di-cu%E1%BB%99c-h%E1%BA%B9n/id6757320991"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111827] text-white border border-[#1a2540] hover:border-amber-400/50 hover:bg-[#1a2540] transition-all duration-200 hover:scale-[1.02] w-full"
              >
                <svg className="w-6 h-6 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] text-gray-500 font-semibold">{t("navigation.footerDownloadOn")}</div>
                  <div className="text-sm font-bold mt-0.5 text-white">App Store</div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 text-xs ml-auto" />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=trove.explore.place.tev"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111827] text-white border border-[#1a2540] hover:border-amber-400/50 hover:bg-[#1a2540] transition-all duration-200 hover:scale-[1.02] w-full"
              >
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M3.23 2.05c-.17.18-.23.49-.23.86v18.18c0 .37.06.68.23.86l.06.06L13.43 12l-10.14-10.01-.06.06z" fill="#3BCCFF"/>
                  <path d="M16.82 8.67L13.43 12l3.39 3.33.06-.03 4.02-2.28c1.15-.65 1.15-1.72 0-2.37l-4.02-2.28-.06.03z" fill="#FFCC00"/>
                  <path d="M13.43 12L3.29 21.96c.38.4 1 .45 1.7.05l11.83-6.71L13.43 12z" fill="#FF3A44"/>
                  <path d="M13.43 12l3.39-3.33L4.99 1.96c-.7-.4-1.32-.35-1.7.05L13.43 12z" fill="#00E676"/>
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] text-gray-500 font-semibold">{t("navigation.footerGetItOn")}</div>
                  <div className="text-sm font-bold mt-0.5 text-white">Google Play</div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-gray-600 text-xs ml-auto" />
              </a>
            </div>
            {/* QR hint */}
            <p className="text-[10px] text-gray-600 font-medium">
              {t("navigation.footerFreeDownload")}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="w-full border-t border-[#1a2540] px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-xs text-gray-600 font-medium">
            &copy; {new Date().getFullYear()} TROVE. {t("navigation.footerRights")}
          </span>
          <div className="flex items-center gap-1 text-gray-700 text-xs font-medium">
            <span>Made with</span>
            <i className="fa-solid fa-heart text-red-500 text-[10px]" />
            <span>in Vietnam 🇻🇳</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-600 font-medium">
            <a href="#" className="hover:text-[#FFCB37] transition-colors">{t("navigation.footerTerms")}</a>
            <a href="#" className="hover:text-[#FFCB37] transition-colors">{t("navigation.footerPrivacy")}</a>
            <a href="#" className="hover:text-[#FFCB37] transition-colors">Cookies</a>
          </div>
        </div>
      </footer>

      {/* Bottom Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 py-3 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] transition-colors">
        <div className="flex items-center justify-around w-full max-w-md mx-auto">
          <Link to="/location" className="flex flex-col items-center gap-1 text-gray-500">
            <i className="fa-solid fa-map-location-dot text-lg"></i>
            <span className="text-[10px] font-bold">{t("navigation.places")}</span>
          </Link>
          <Link to="/plans" className="flex flex-col items-center gap-1 text-gray-500">
            <i className="fa-solid fa-heart text-lg"></i>
            <span className="text-[10px] font-bold">{t("navigation.date")}</span>
          </Link>
          <Link to="/account" className="flex flex-col items-center gap-1 text-gray-500">
            <i className="fa-solid fa-circle-user text-lg"></i>
            <span className="text-[10px] font-bold">{t("navigation.me")}</span>
          </Link>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
}
