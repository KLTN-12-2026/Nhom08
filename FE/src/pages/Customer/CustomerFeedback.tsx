import React, { useState } from "react";
import { Input, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../stores/languageStore.ts";
import RepositoryManager from "../../data/repositoryManager";

export default function CustomerFeedback() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("");
  const [categoryKey, setCategoryKey] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const categories = [
    { key: "fbFeature", emoji: "💡" },
    { key: "fbBug", emoji: "🐛" },
    { key: "fbRoast", emoji: "😤" },
    { key: "fbFeedback", emoji: "💬" },
    { key: "fbInvite", emoji: "🎉" },
  ];

  const handleSelect = (key: string, emoji: string) => {
    setCategoryKey(key);
    setCategory(`${emoji} ${t(`publicPlaces.${key}`)}`);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!categoryKey) {
      message.error("Vui lòng chọn một danh mục!");
      return;
    }
    if (!content.trim()) {
      message.error("Vui lòng nhập nội dung góp ý!");
      return;
    }

    setLoading(true);
    try {
      // Map categoryKey to ticket type integer matching TicketType:
      // Feature = 0, Bug = 1, Complaint = 2, Feedback = 3, Other = 4
      let ticketType = 3; // Default to Feedback
      if (categoryKey === "fbFeature") ticketType = 0;
      else if (categoryKey === "fbBug") ticketType = 1;
      else if (categoryKey === "fbRoast") ticketType = 2;
      else if (categoryKey === "fbFeedback") ticketType = 3;
      else if (categoryKey === "fbInvite") ticketType = 4;

      const res = await RepositoryManager.ticketsUser.create({
        subject: category,
        description: content,
        type: ticketType,
      });

      if (res && (res.success || res.id || res.data)) {
        message.success("Cảm ơn bạn! Góp ý đã được gửi tới đội ngũ phát triển.");
        setCategory("");
        setCategoryKey("");
        setContent("");
        navigate("/");
      } else {
        message.error("Không thể gửi góp ý. Vui lòng thử lại sau!");
      }
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Đã xảy ra lỗi khi gửi góp ý!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8 relative overflow-hidden">
      
      {/* Web Page Header */}
      <div className="border-b border-gray-150 dark:border-gray-800 pb-5 text-center">
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display">
          {t("publicPlaces.feedbackTitle")}
        </h1>
        <p className="text-gray-500 font-semibold text-sm mt-1">
          {t("publicPlaces.feedbackSubtitle")}
        </p>
      </div>

      {/* Main Feedback Form Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.03)]">
        <div className="space-y-6">
          
          {/* Custom Dropdown Selector */}
          <div className="relative">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
              {t("publicPlaces.selectCategory")}
            </label>
            
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-14 px-5 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black text-sm rounded-2xl flex items-center justify-between cursor-pointer shadow-sm select-none transition-all duration-200"
            >
              <span>{categoryKey ? `${category}` : t("publicPlaces.selectCategory")}</span>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[105%] left-0 right-0 bg-white dark:bg-gray-850 rounded-2xl shadow-xl overflow-hidden z-50 py-1.5 border border-gray-100 dark:border-gray-800">
                {categories.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() => handleSelect(cat.key, cat.emoji)}
                    className="px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <span className="text-base shrink-0">{cat.emoji}</span>
                    <span>{t(`publicPlaces.${cat.key}`)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text Area for Content */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider block">
              {t("publicPlaces.feedbackContent")}
            </label>
            <Input.TextArea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("publicPlaces.feedbackPlaceholder")}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all resize-none"
            />
          </div>

          {/* Confidential Note */}
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 dark:text-amber-400 font-semibold leading-relaxed border border-amber-100 dark:border-amber-900/50">
            <i className="fa-solid fa-shield-halved text-base shrink-0 mt-0.5" />
            <span>{t("publicPlaces.feedbackPrivacy")}</span>
          </div>

          {/* Yellow Action Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-14 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black rounded-2xl text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch animate-spin" />
            ) : (
              <i className="fa-solid fa-paper-plane" />
            )}
            {t("publicPlaces.submitRequest")}
          </button>
          
        </div>
      </Card>
    </div>
  );
}
