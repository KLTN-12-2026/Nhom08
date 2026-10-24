"use client";
import { useState, useEffect } from "react";
import Header from "../components/Layout/Header.tsx";
import Sidebar from "../components/Layout/Sidebar.tsx";

export default function MainLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 w-full overflow-hidden transition-colors duration-300">
      <Sidebar
        collapsed={isMobile ? !sidebarCollapsed : sidebarCollapsed}
        onClose={() => setSidebarCollapsed(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 w-full">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
