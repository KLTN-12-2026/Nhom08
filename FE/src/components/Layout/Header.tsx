"use client";

import React, { useState, useEffect } from "react";
import { Input, Avatar, Badge, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import useDataMainStore from "../../stores/dataMainStore";
import LanguageSwitcher from "../LanguageSwitcher.tsx";
import useLanguageStore from "../../stores/languageStore.ts";
import useThemeStore from "../../stores/themeStore.ts";
import useDomainStore from "../../stores/domainStore.ts";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useDataMainStore();
  const { t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "settings",
      label: (
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-gear text-black"></i>
          <span>{t("navigation.settings")}</span>
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
          <span>{t("auth.logout")}</span>
        </div>
      ),
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "settings") {
      navigate("/admin/settings");
    } else if (e.key === "logout") {
      logout();
      localStorage.clear();
      navigate("/admin/login");
    }
  };

  // Get role display text with color
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, { text: string; color: string }> = {
      admin: { text: "Administrator", color: "gold" },
      user: { text: "User", color: "blue" },
      moderator: { text: "Moderator", color: "purple" },
    };
    return roleMap[role] || { text: role, color: "default" };
  };

  const roleDisplay = user?.role ? getRoleDisplay(user.role) : { text: "User", color: "default" };

  // Domain Switcher logic from store
  const { currentDomain, switchDomain, getDomainLabel, getDomainColor, getDomainIcon } = useDomainStore();

  const domainMenuItems: MenuProps["items"] = [
    {
      key: "local",
      onClick: () => switchDomain("local"),
      label: (
        <div className="flex items-center justify-between gap-4 py-1.5 px-1 min-w-[170px]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-server text-[#fa8c16] text-sm w-4 text-center"></i>
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-gray-100">Local</span>
              <p className="text-[10px] text-gray-400 font-mono m-0">127.0.0.1:8000</p>
            </div>
          </div>
          {currentDomain === "local" && <i className="fa-solid fa-circle-check text-green-500 text-xs" />}
        </div>
      ),
    },
    {
      key: "dev",
      onClick: () => switchDomain("dev"),
      label: (
        <div className="flex items-center justify-between gap-4 py-1.5 px-1 min-w-[170px]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-code-branch text-[#1890ff] text-sm w-4 text-center"></i>
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-gray-100">Dev</span>
              <p className="text-[10px] text-gray-400 font-mono m-0">bedev.trove.id.vn</p>
            </div>
          </div>
          {currentDomain === "dev" && <i className="fa-solid fa-circle-check text-green-500 text-xs" />}
        </div>
      ),
    },
    {
      key: "production",
      onClick: () => switchDomain("production"),
      label: (
        <div className="flex items-center justify-between gap-4 py-1.5 px-1 min-w-[170px]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-cloud text-[#52c41a] text-sm w-4 text-center"></i>
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-gray-100">Production (Prod)</span>
              <p className="text-[10px] text-gray-400 font-mono m-0">main.be.trove.id.vn</p>
            </div>
          </div>
          {currentDomain === "production" && <i className="fa-solid fa-circle-check text-green-500 text-xs" />}
        </div>
      ),
    },
  ];
  return (
    <header className="bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-10 shadow-sm transition-colors duration-300 h-[73px] flex items-center">
      <div className="flex items-center justify-between px-6 gap-4 w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-yellow-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600"
          >
            <i className="fa-solid fa-bars text-black dark:text-white text-xl"></i>
          </button>

          <Input
            placeholder="Search or type command..."
            prefix={
              <i className="fa-solid fa-magnifying-glass text-gray-400 text-lg"></i>
            }
            suffix={
              <i className="fa-solid fa-magnifying-glass text-gray-400 cursor-pointer hover:text-primary-500"></i>
            }
            className="hover:border-primary-400 focus:border-primary-500 transition-all w-full max-w-xl dark:bg-gray-800 dark:text-white dark:border-gray-700"
            style={{
              borderRadius: "1rem",
              backgroundColor: theme === 'dark' ? '#1f2937' : '#FAFAFA',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid #f0f0f0'
            }}
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-yellow-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600 relative"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-yellow-500' : 'fa-moon text-black'} text-xl`}></i>
          </button>

          {/* Domain Switcher */}
          <Dropdown menu={{ items: domainMenuItems }} trigger={["click", "hover"]} placement="bottom">
            <button
              className="p-2 hover:bg-yellow-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 relative group cursor-pointer"
              style={{
                backgroundColor: getDomainColor() + "15",
                border: `1px solid ${getDomainColor()}40`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <i className={`fa-solid ${getDomainIcon()} text-sm`} style={{ color: getDomainColor() }}></i>
                <span className="text-xs font-semibold" style={{ color: getDomainColor() }}>
                  {getDomainLabel()}
                </span>
                <i className="fa-solid fa-chevron-down text-[9px] opacity-60 ml-0.5" style={{ color: getDomainColor() }}></i>
              </div>
            </button>
          </Dropdown>

          <LanguageSwitcher />

          <Badge count={3} size="small" color="#FFCB37" offset={[-2, 2]}>
            <button
              onClick={() => navigate("/admin/notifications")}
              className="p-2 hover:bg-yellow-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary-600"
            >
              <i className="fa-solid fa-bell text-black dark:text-white text-xl"></i>
            </button>
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="flex items-center gap-3 cursor-pointer hover:bg-yellow-50 dark:hover:bg-gray-800 px-3 py-2 rounded-2xl transition-all duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-850 hover:shadow-sm">
              <Avatar
                src={user?.avatar || undefined}
                size={42}
                className="border-2 border-primary-200 shadow-sm bg-gradient-to-br from-yellow-100 to-yellow-200"
                style={{
                  backgroundColor: user?.avatar ? undefined : "#FEF3C7"
                }}
              >
                {!user?.avatar && (
                  <span className="text-primary-600 font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </Avatar>
              <div className="text-left hidden md:block">
                <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {user?.name || "Admin User"}
                  {user?.role === "admin" && (
                    <i className="fa-solid fa-shield-halved text-primary-500 text-xs"></i>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {user?.email || "admin@example.com"}
                </div>
              </div>
              <i className="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform group-hover:rotate-180"></i>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
