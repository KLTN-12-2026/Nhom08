import React from "react";
import { Badge } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";

export default function WhatsNew() {
  const { t } = useLanguageStore();

  const updates = [
    {
      version: "v2.1.0",
      title: t("whatsNew.v210Title"),
      desc: t("whatsNew.v210Desc"),
      status: t("whatsNew.v210Status"),
      icon: "fa-solid fa-star text-amber-500 animate-pulse",
      color: "from-amber-400 to-orange-500",
      badgeColor: "bg-amber-500/10 text-[#E6B000] border-amber-500/30",
    },
    {
      version: "v2.0.0",
      title: t("whatsNew.v200Title"),
      desc: t("whatsNew.v200Desc"),
      status: null,
      icon: "fa-solid fa-bolt text-blue-500",
      color: "from-blue-400 to-indigo-500",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    },
    {
      version: "v1.5.0",
      title: t("whatsNew.v150Title") || "Cổng thanh toán Premium",
      desc: t("whatsNew.v150Desc") || "Mở rộng hình thức thanh toán nâng cấp VIP qua QR Code và các dòng thẻ quốc tế tiện lợi.",
      status: null,
      icon: "fa-solid fa-lock-open text-green-500",
      color: "from-green-400 to-emerald-500",
      badgeColor: "bg-green-500/10 text-green-500 border-green-500/30",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-[#E6B000] border border-amber-500/20">
          <i className="fa-solid fa-wand-magic-sparkles animate-pulse" />
          {t("whatsNew.title") || "Tính năng mới"}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight leading-none drop-shadow-sm">
          {t("whatsNew.title") || "Tính năng mới"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm leading-relaxed">
          {t("whatsNew.subtitle") || "Cập nhật những cải tiến và tính năng mới nhất từ hệ thống Trove."}
        </p>
      </div>

      {/* Modern Custom Timeline Grid */}
      <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 md:ml-32 pl-8 md:pl-12 space-y-12 py-4">
        {updates.map((item, index) => (
          <div key={index} className="relative group text-left">
            {/* Version Badge left-floating on Desktop */}
            <div className="absolute -left-[42px] md:-left-[148px] top-1.5 flex items-center justify-end w-24 hidden md:flex">
              <span className={`px-3.5 py-1 text-xs font-black rounded-xl border ${item.badgeColor} shadow-sm`}>
                {item.version}
              </span>
            </div>

            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[45px] md:-left-[61px] top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-md group-hover:border-[#FFCB37] group-hover:scale-110 transition-all duration-300 z-10">
              <i className={item.icon} />
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 pointer-events-none" />

            {/* Content Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group-hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)] group-hover:-translate-y-1 transition-all duration-300 space-y-4">
              {/* Header inside card for mobile views */}
              <div className="flex items-center justify-between gap-3 md:hidden">
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border ${item.badgeColor}`}>
                  {item.version}
                </span>
                {item.status && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-green-500/10 text-green-500 border border-green-500/20">
                    {item.status}
                  </span>
                )}
              </div>

              {/* Title & Status (Desktop) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg md:text-xl font-black text-black dark:text-white group-hover:text-[#E6B000] transition-colors leading-tight">
                  {item.title}
                </h3>
                {item.status && (
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-black bg-green-500/15 text-green-500 border border-green-500/20 animate-pulse">
                    ✨ {item.status}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm leading-relaxed whitespace-pre-line">
                {item.desc}
              </p>

              {/* Extra visual indicators / Micro features list */}
              <div className="flex items-center gap-4 pt-3.5 border-t border-gray-100 dark:border-gray-850/50 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-circle-check text-green-500" /> {t("whatsNew.updateDone")}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved" /> {t("whatsNew.securitySystem")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
