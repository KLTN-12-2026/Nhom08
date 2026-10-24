"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";
import useThemeStore from "../../stores/themeStore.ts";

interface SidebarProps {
  collapsed: boolean;
  onClose?: () => void;
}

// Routes definition
const ROUTES = {
  HOME: "/admin/home",
  STATISTICS: "/admin/statistics",
  USERS: "/admin/users",
  PLACES: "/admin/places",
  CASHFLOW: "/admin/cashflow",
  TAGS: "/admin/tags",
  CATEGORIES: "/admin/categories",
  ANNOUNCEMENTS: "/admin/announcements",
  ACTIVITY_GROUPS: "/admin/activity-groups",
  QUOTES: "/admin/quotes",
  TICKETS: "/admin/support",
  NOTIFICATIONS: "/admin/notifications",
  SUBSCRIPTIONS: "/admin/subscriptions",
  SETTINGS: "/admin/settings",
} as const;

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguageStore();
  const { theme } = useThemeStore();

  // Menu configuration with translations and icons
  const MENU_CONFIG = useMemo(() => [
    { key: "home", label: t("navigation.home"), path: ROUTES.HOME, icon: "fa-house" },
    { key: "users", label: t("navigation.users"), path: ROUTES.USERS, icon: "fa-users" },
    { key: "places", label: t("navigation.places"), path: ROUTES.PLACES, icon: "fa-map-location-dot" },
    { key: "statistics", label: t("navigation.statistics"), path: ROUTES.STATISTICS, icon: "fa-chart-line" },
    {

      key: "config",
      label: t("navigation.config"),
      icon: "fa-sliders",
      children: [
        { key: "tags", label: t("navigation.tags"), path: ROUTES.TAGS, icon: "fa-tags" },
        { key: "categories", label: t("navigation.categories"), path: ROUTES.CATEGORIES, icon: "fa-list" },
        { key: "activity-groups", label: t("navigation.activityGroups"), path: ROUTES.ACTIVITY_GROUPS, icon: "fa-people-group" },
        { key: "quotes", label: t("navigation.quotes"), path: ROUTES.QUOTES, icon: "fa-quote-left" },
      ]
    },
    {
      key: "notifications-group",
      label: t("navigation.notificationsGroup"),
      icon: "fa-bell",
      children: [
        { key: "announcements", label: t("navigation.announcements"), path: ROUTES.ANNOUNCEMENTS, icon: "fa-bullhorn" },
        { key: "notifications", label: t("navigation.notifications"), path: ROUTES.NOTIFICATIONS, icon: "fa-bell" },
      ]
    },
    { key: "tickets", label: t("navigation.tickets"), path: ROUTES.TICKETS, icon: "fa-comments" },
    { key: "subscriptions", label: t("navigation.subscriptions"), path: ROUTES.SUBSCRIPTIONS, icon: "fa-credit-card" },
    { key: "settings", label: t("navigation.settings"), path: ROUTES.SETTINGS, icon: "fa-gear" },
  ], [t]);

  // Flattened menu config helper for routing/active key checks
  const flatMenuItems = useMemo(() => {
    const flat: any[] = [];
    MENU_CONFIG.forEach((item) => {
      if (item.children) {
        flat.push(...item.children);
      } else {
        flat.push(item);
      }
    });
    return flat;
  }, [MENU_CONFIG]);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeKey = useMemo(() => {
    const item = flatMenuItems.find((i) => location.pathname === i.path);
    return item?.key || "";
  }, [location.pathname, flatMenuItems]);

  // Automatically expand parent menu item containing the active route
  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    } else {
      const parent = MENU_CONFIG.find(
        (item) => item.children && item.children.some((child) => child.path === location.pathname)
      );
      if (parent && !openKeys.includes(parent.key)) {
        setOpenKeys((prev) => [...prev, parent.key]);
      }
    }
  }, [location.pathname, MENU_CONFIG, collapsed]);

  const handleMenuClick = (e: any) => {
    const item = flatMenuItems.find((i) => i.key === e.key);
    if (item) navigate(item.path);
    if (isMobile && onClose) onClose();
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const menuItems = useMemo(
    () => [
      ...MENU_CONFIG.map((i) => {
        if (i.children) {
          return {
            key: i.key,
            icon: i.icon ? <i className={`fa-solid ${i.icon} text-base`} /> : undefined,
            label: i.label,
            children: i.children.map((c: any) => ({
              key: c.key,
              icon: c.icon ? <i className={`fa-solid ${c.icon} text-sm`} /> : undefined,
              label: c.label,
            })),
          };
        }
        return {
          key: i.key,
          icon: i.icon ? <i className={`fa-solid ${i.icon} text-base`} /> : undefined,
          label: i.label,
        };
      }),
    ],
    [MENU_CONFIG]
  );

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          className={`transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 overflow-y-auto overflow-x-hidden ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="flex items-center p-6 border-b border-gray-100 dark:border-gray-800 mb-2 h-[73px]">
            {collapsed ? null : (
              <div
                className="flex items-center justify-between w-full px-2 cursor-pointer group"
                onClick={() => navigate("/admin/home")}
              >
                <span className="text-3xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FFE27A] to-[#FFCB37] bg-clip-text text-transparent font-sans group-hover:opacity-80 transition-opacity">
                  TREVO
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-[#FFCB37]/15 text-[#FFCB37] rounded-md border border-[#FFCB37]/30 uppercase tracking-widest">
                  Admin
                </span>
              </div>
            )}
          </div>
          <div className={collapsed ? "px-0" : "px-4"}>
            <Menu
              mode="inline"
              theme={theme}
              inlineCollapsed={collapsed}
              selectedKeys={[activeKey]}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              items={menuItems}
              className="border-none bg-transparent"
              onClick={handleMenuClick}
            />
          </div>
        </div>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={`z-[1] fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          onClick={onClose}
        >
          <div
            className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${collapsed ? "-translate-x-full" : "translate-x-0"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 h-[73px]">
              <span className="text-3xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FFE27A] to-[#FFCB37] bg-clip-text text-transparent font-sans">
                TREVO
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#FFCB37]/15 text-[#FFCB37] rounded-md border border-[#FFCB37]/30 uppercase tracking-widest">
                Admin
              </span>
            </div>
            <div className="px-4 mt-4">
              <Menu
                mode="inline"
                theme={theme}
                selectedKeys={[activeKey]}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                items={menuItems}
                className="border-none bg-transparent"
                onClick={handleMenuClick}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
