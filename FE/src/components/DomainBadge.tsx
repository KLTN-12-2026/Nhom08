"use client";

import React, { useEffect, useState } from "react";
import useDomainStore from "../stores/domainStore.ts";

interface DomainBadgeProps {
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function DomainBadge({
  showIcon = true,
  className = "",
  size = "md"
}: DomainBadgeProps) {
  const { currentDomain, initializeDomain, getDomainLabel, getDomainColor, getDomainIcon, toggleDomain } = useDomainStore();

  useEffect(() => {
    // Initialize domain on mount
    initializeDomain();

    // Update domain when localStorage changes
    const checkDomain = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("api-domain-preference");
        if (saved && saved !== currentDomain && ["local", "dev", "production"].includes(saved)) {
          useDomainStore.getState().setCurrentDomain(saved);
        }
      }
    };

    // Check periodically
    const interval = setInterval(checkDomain, 1000);
    return () => clearInterval(interval);
  }, [currentDomain, initializeDomain]);

  const handleClick = () => {
    toggleDomain();
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      onClick={handleClick}
      title="Nhấn để đổi môi trường (Local / Dev / Prod)"
      className={`inline-flex items-center gap-2 rounded-full font-semibold cursor-pointer hover:opacity-80 transition-opacity ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: getDomainColor() + "20",
        color: getDomainColor(),
        border: `1px solid ${getDomainColor()}40`,
      }}
    >
      {showIcon && (
        <i className={`fa-solid ${getDomainIcon()} ${iconSizes[size]}`}></i>
      )}
      <span>{getDomainLabel()}</span>
    </div>
  );
}
