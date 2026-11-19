import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Spin } from "antd";
import { RepositoryManager } from "../data/repositoryManager";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là Trove AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load places when the component mounts
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await RepositoryManager.places.getPublicPlaces({ per_page: 100 });
        if (res && res.data && Array.isArray(res.data)) {
          setPlaces(res.data);
        } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
          setPlaces(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load places for AI context:", error);
      }
    };

    fetchPlaces();
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = typeof customText === "string" ? customText : inputVal;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputVal("");
    setLoading(true);

    try {
      // Build context of places
      const placesContext = places
        .map((p) => `- ${p.name}: Địa chỉ: ${p.address || "Chưa rõ"}. Mô tả: ${p.description || "Chưa có mô tả"}.`)
        .join("\n");

      const systemInstruction = `Bạn là Trove AI Assistant - trợ lý ảo thông minh của ứng dụng hẹn hò và vui chơi TROVE.
Dưới đây là danh sách các địa điểm vui chơi, hẹn hò trong hệ thống dữ liệu của TROVE:
${placesContext}

Dưới đây là các đường dẫn liên kết nội bộ (Internal Links) tương ứng với các tính năng của TROVE. Bạn PHẢI sử dụng chính xác các đường dẫn này khi hướng dẫn người dùng:
- Trang chủ: [/](/)
- Tìm kiếm địa điểm: [/location](/location)
- Thêm mới địa điểm / Đóng góp địa điểm mới: [/places/create](/places/create)
- Lên kế hoạch / Tạo kế hoạch (Date Planner): [/plans](/plans)
- Vòng quay địa điểm ngẫu nhiên (Date Spin): [/date/spin](/date/spin)
- Nâng cấp VIP/Premium: [/premium](/premium)
- Danh sách địa điểm yêu thích: [/favorites](/favorites)
- Góp ý ý tưởng / Đóng góp ý kiến về tính năng: [/feedback](/feedback)
- Quản lý hồ sơ cá nhân: [/account](/account)
- Rạp chiếu phim / Danh sách phim: [/movies](/movies)
- Bản đồ Google Maps: [/google-maps](/google-maps)
- Thông báo: [/notifications](/notifications)

NHIỆM VỤ:
1. Khi người dùng hỏi về gợi ý địa điểm, quán ăn, quán cafe, nơi hẹn hò hoặc vui chơi, hãy ƯU TIÊN giới thiệu các địa điểm có sẵn trong danh sách trên của TROVE.
2. Khi người dùng muốn truy cập hoặc thực hiện chức năng nào đó, bạn PHẢI giải thích rõ ràng và chi tiết tính năng đó hoạt động như thế nào, đem lại lợi ích gì cho họ trước khi đưa ra liên kết. Đừng chỉ đưa liên kết một cách ngắn gọn.
   - Ví dụ: Đối với [Vòng quay địa điểm ngẫu nhiên](/date/spin), hãy giải thích đây là công cụ giúp bạn giải quyết sự phân vân bằng cách quay ngẫu nhiên ra quán ăn, tiệm cafe hoặc điểm đi chơi lý tưởng dựa trên bộ lọc vị trí/loại hình, người dùng chỉ việc nhấn nút quay để chọn ra một điểm hẹn ngẫu nhiên.
   - Đối với [Tạo kế hoạch](/plans), hãy giải thích đây là tính năng giúp tạo lịch trình hoàn chỉnh từ điểm đón, địa điểm ăn uống, hoạt động giải trí theo thời gian cụ thể để tối ưu hóa buổi hẹn hò của bạn.
   - Đối với [Đóng góp ý tưởng](/feedback), giải thích đây là nơi người dùng gửi góp ý về giao diện, tính năng mới mong muốn trên app để đội ngũ phát triển cải tiến hệ thống.
3. Cung cấp liên kết hướng dẫn họ truy cập dưới dạng markdown [Tên chức năng](Đường dẫn).
4. Trả lời chi tiết, dễ hiểu, thân thiện, và bắt buộc phải viết rõ ràng từng ý bằng cách sử dụng dấu xuống dòng (xuống hàng) và gạch đầu dòng dạng danh sách rõ ràng, tuyệt đối không viết gom tất cả các ý thành một đoạn văn dài cộc lốc.`;

      // Map chat messages to Gemini's format
      const geminiContents = updatedMessages
        .filter((m) => m.content)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: geminiContents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `API Error: ${response.status}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason;

      if (finishReason === "SAFETY") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Yêu cầu của bạn đã bị từ chối do vi phạm chính sách an toàn của AI. Vui lòng đặt câu hỏi khác lịch sự hơn.",
          },
        ]);
        return;
      }

      const aiResponse = candidate?.content?.parts?.[0]?.text;

      if (aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiResponse,
          },
        ]);
      } else {
        throw new Error("Không thể trích xuất câu trả lời từ cấu trúc dữ liệu Gemini.");
      }
    } catch (error: any) {
      console.error("Gemini AI error:", error);
      let errorMsg = "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI. Bạn vui lòng thử lại sau.";
      const errorStr = error?.message || "";
      if (
        errorStr.includes("429") ||
        errorStr.toLowerCase().includes("quota") ||
        errorStr.toLowerCase().includes("rate limit") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.toLowerCase().includes("limit")
      ) {
        errorMsg = "Hệ thống đang bị quá tải do số lượng người sử dụng nhiều. Vui lòng thử lại sau.";
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMsg,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Xin chào! Tôi là Trove AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?",
      },
    ]);
  };

  // Helper to parse markdown links [Text](URL) into clickable elements
  const renderMessageContent = (content: string) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const text = match[1];
      const url = match[2];

      if (url.startsWith("/")) {
        parts.push(
          <a
            key={match.index}
            href={url}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = url;
            }}
            className="text-[#FF9F1C] hover:underline font-bold"
          >
            {text}
          </a>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF9F1C] hover:underline font-bold"
          >
            {text}
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="fixed z-[9999] right-6 bottom-20 md:bottom-8 font-sans text-gray-900 dark:text-gray-100">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FFCB37] to-[#FF9F1C] text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative group"
        >
          <i className="fa-solid fa-robot text-xl animate-bounce" />
          <span className="absolute -top-2 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          {/* Tooltip */}
          <div className="absolute right-16 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            Hỏi Trove AI
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FFCB37] to-[#FF9F1C] px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <Avatar
                size={40}
                className="bg-black/10 border-2 border-white flex items-center justify-center"
              >
                <i className="fa-solid fa-robot text-black text-lg" />
              </Avatar>
              <div>
                <h3 className="font-bold text-black text-sm m-0 leading-none">
                  Trove AI Assistant
                </h3>
                <span className="text-[10px] text-green-800 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                title="Xóa cuộc trò chuyện"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-black flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-trash-can text-xs" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-black flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {m.role === "assistant" && (
                  <Avatar
                    size={32}
                    className="bg-[#FFCB37] flex items-center justify-center flex-shrink-0"
                  >
                    <i className="fa-solid fa-robot text-black text-xs" />
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-black text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-150 border border-gray-100 dark:border-gray-800 rounded-tl-none"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {renderMessageContent(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <Avatar
                  size={32}
                  className="bg-[#FFCB37] flex items-center justify-center flex-shrink-0"
                >
                  <i className="fa-solid fa-robot text-black text-xs" />
                </Avatar>
                <div className="bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
                  <Spin size="small" />
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 block px-1">Gợi ý câu hỏi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Gợi ý quán cafe đẹp ở Đà Nẵng",
                    "Gợi ý địa điểm hẹn hò lãng mạn",
                    "Cách dùng vòng quay ngẫu nhiên?",
                    "Cách lên kế hoạch đi chơi?",
                  ].map((sugg, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sugg)}
                      className="text-xs bg-white dark:bg-gray-800 hover:bg-[#FFCB37]/20 border border-gray-200 dark:border-gray-700 hover:border-[#FFCB37] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-all text-left shadow-2xs"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onPressEnter={handleSend}
              placeholder="Nhập tin nhắn..."
              disabled={loading}
              className="flex-1 rounded-full border-gray-200 dark:border-gray-800 focus:border-amber-400 focus:shadow-none bg-gray-50/50 dark:bg-gray-850 py-2 px-4 text-sm"
            />
            <Button
              type="primary"
              onClick={handleSend}
              disabled={!inputVal.trim() || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#FFCB37] to-[#FF9F1C] border-none text-black shrink-0 hover:scale-105 transition-transform"
              icon={<i className="fa-solid fa-paper-plane text-xs" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
