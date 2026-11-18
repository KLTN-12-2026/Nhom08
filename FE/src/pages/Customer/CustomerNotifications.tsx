import React, { useState } from "react";
import useLanguageStore from "../../stores/languageStore.ts";

interface Notification {
  id: number;
  title: string;
  content: string;
  date: string;
}

export default function CustomerNotifications() {
  const { t } = useLanguageStore();
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Sắp ra mắt",
      content: "Hôm nay trời đẹp, thay đồ đi chụp vài tấm",
      date: "07/01/2026"
    },
    {
      id: 2,
      title: "Vc thật này là ngày nghỉ thứ 3 r",
      content: "Cuộc sống thật khó khi không có tiền",
      date: "03/01/2026"
    }
  ]);

  const [translatedIds, setTranslatedIds] = useState<number[]>([]);
  const [translatingIds, setTranslatingIds] = useState<number[]>([]);

  const translations: Record<number, { title: string; content: string }> = {
    1: {
      title: "Coming Soon",
      content: "Today is a beautiful day, dress up and go take some photos"
    },
    2: {
      title: "Damn, this is the 3rd day off already",
      content: "Life is indeed hard when you have no money"
    }
  };

  const toggleTranslate = (id: number) => {
    if (translatedIds.includes(id)) {
      setTranslatedIds(prev => prev.filter(item => item !== id));
    } else {
      setTranslatingIds(prev => [...prev, id]);
      setTimeout(() => {
        setTranslatingIds(prev => prev.filter(item => item !== id));
        setTranslatedIds(prev => [...prev, id]);
      }, 600);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">
          {t("notifications.pageTitle")}
        </h1>
        <p className="text-gray-500 font-semibold text-sm mt-1">
          {t("notifications.pageSub")}
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[32px] shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[#FFCB37] flex items-center justify-center text-2xl mx-auto">
            <i className="fa-regular fa-bell-slash" />
          </div>
          <p className="text-gray-400 font-bold text-sm">{t("notifications.noNotifications")}</p>
          <p className="text-gray-300 dark:text-gray-600 font-semibold text-xs">{t("notifications.noNotificationsSub")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => {
            const isTranslated = translatedIds.includes(item.id);
            const isTranslating = translatingIds.includes(item.id);
            const displayTitle = isTranslated && translations[item.id] ? translations[item.id].title : item.title;
            const displayContent = isTranslated && translations[item.id] ? translations[item.id].content : item.content;

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
