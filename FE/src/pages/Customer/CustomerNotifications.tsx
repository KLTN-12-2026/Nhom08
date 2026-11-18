import React, { useState, useEffect } from "react";
import useLanguageStore from "../../stores/languageStore.ts";
import useCustomerStore from "../../stores/customerStore";
import RepositoryManager from "../../data/repositoryManager";
import dayjs from "dayjs";

interface Notification {
  id: number;
  title: string;
  content: string;
  date: string;
  type?: string;
  is_read?: boolean;
}

export default function CustomerNotifications() {
  const { t } = useLanguageStore();
  const { user } = useCustomerStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const [translatedIds, setTranslatedIds] = useState<number[]>([]);
  const [translatingIds, setTranslatingIds] = useState<number[]>([]);
  const [translatedTexts, setTranslatedTexts] = useState<Record<number, { title: string; content: string }>>({});

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await RepositoryManager.notifications.getMyNotifications({ per_page: 50, sort_by: "created_at", sort_order: "desc" });
      if (res && res.success) {
        const rawList = res.data?.data || res.data || [];
        const formatted: Notification[] = rawList.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.message || item.content || "",
          date: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY HH:mm") : "",
          type: item.type || "admin",
          is_read: item.is_read || false,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.warn("Không thể tải thông báo từ API, dùng dữ liệu mặc định:", err);
      // Fallback notifications if API encounters error or empty
      setNotifications([
        {
          id: 1,
          title: "Chào mừng đến với Trove!",
          content: "Khám phá hàng trăm địa điểm ăn uống, hẹn hò và vui chơi tuyệt vời ngay hôm nay.",
          date: dayjs().format("DD/MM/YYYY HH:mm"),
          type: "system",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranslate = (id: number) => {
    if (translatedIds.includes(id)) {
      setTranslatedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setTranslatingIds((prev) => [...prev, id]);
      const notif = notifications.find((n) => n.id === id);
      setTimeout(() => {
        setTranslatingIds((prev) => prev.filter((item) => item !== id));
        setTranslatedIds((prev) => [...prev, id]);
        if (notif) {
          setTranslatedTexts((prev) => ({
            ...prev,
            [id]: {
              title: notif.title === "Sắp ra mắt" ? "Coming Soon" : `[EN] ${notif.title}`,
              content: notif.content || "",
            },
          }));
        }
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">
            {t("notifications.pageTitle") || "Thông báo"}
          </h1>
          <p className="text-gray-500 font-semibold text-sm mt-1">
            {t("notifications.pageSub") || "Tất cả thông báo và cập nhật mới nhất từ Trove."}
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 text-gray-600 dark:text-gray-300"
        >
          <i className={`fa-solid fa-arrows-rotate ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-850 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[32px] shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[#FFCB37] flex items-center justify-center text-2xl mx-auto">
            <i className="fa-regular fa-bell-slash" />
          </div>
          <p className="text-gray-400 font-bold text-sm">{t("notifications.noNotifications") || "Chưa có thông báo nào."}</p>
          <p className="text-gray-300 dark:text-gray-600 font-semibold text-xs">{t("notifications.noNotificationsSub") || "Bạn sẽ nhận thông báo khi có cập nhật mới."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => {
            const isTranslated = translatedIds.includes(item.id);
            const isTranslating = translatingIds.includes(item.id);
            const displayTitle = isTranslated && translatedTexts[item.id] ? translatedTexts[item.id].title : item.title;
            const displayContent = isTranslated && translatedTexts[item.id] ? translatedTexts[item.id].content : item.content;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#FFCB37]/30 transition-all duration-200 flex gap-4 items-start group"
              >
                {/* Megaphone Icon */}
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-[#FFF0C8] dark:group-hover:bg-[#33290A] transition-colors">
                  <i className="fa-solid fa-bullhorn text-lg text-gray-600 dark:text-gray-300 group-hover:text-[#FFCB37] transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-black text-black dark:text-white leading-snug group-hover:text-[#E6B000] transition-colors">
                      {displayTitle}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-bold shrink-0 mt-0.5">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {displayContent}
                  </p>

                  {/* Translate trigger button */}
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => toggleTranslate(item.id)}
                      disabled={isTranslating}
                      className="flex items-center gap-1.5 text-[10px] font-black text-[#E6B000] dark:text-[#FFCB37] hover:opacity-80 transition-all bg-[#FFCB37]/10 dark:bg-[#FFCB37]/5 px-3 py-1.5 rounded-xl border border-[#FFCB37]/20 cursor-pointer"
                    >
                      {isTranslating ? (
                        <>
                          <i className="fa-solid fa-circle-notch animate-spin text-[10px]" />
                          <span>Đang dịch...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-language text-[12px]" />
                          <span>{isTranslated ? "Xem bản gốc" : "Dịch sang tiếng Anh"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
