import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, message, Popconfirm } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useLanguageStore from "../../stores/languageStore.ts";
import RepositoryManager from "../../data/repositoryManager";
import {
  CoordinationData,
  MergedPlanResult,
  buildFallbackResult,
  buildPlanMeta,
  computeCandidateSlots,
  decodePayload,
  encodePayload,
  formatDateDisplay,
  importResponsePayload,
  listCoordinations,
  loadCoordination,
  parseDMY,
  requestAIMerge,
  saveCoordination,
  deriveHostOptions,
  mergeResponses,
  GuestResponse,
} from "./planCoordination.ts";

const FIT_STYLES: Record<string, { box: string; icon: string; label: { vn: string; en: string } }> = {
  fit: {
    box: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: "fa-circle-check text-emerald-500",
    label: { vn: "Tham gia được", en: "Can attend" },
  },
  partial: {
    box: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: "fa-circle-half-stroke text-amber-500",
    label: { vn: "Trùng một phần", en: "Partial" },
  },
  no_fit: {
    box: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    icon: "fa-circle-xmark text-rose-500",
    label: { vn: "Không trùng lịch", en: "Cannot attend" },
  },
};

export default function PlanResponsesView() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const isEn = currentLanguage === "en";
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState<CoordinationData | null>(null);
  const [allPlans, setAllPlans] = useState<CoordinationData[]>([]);
  const [pasteValue, setPasteValue] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const slots = useMemo(() => (data ? computeCandidateSlots(data.responses) : []), [data]);

  /* ----- Load plan / import a response coming from the guest's link ----- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("r");
    let activeId = params.get("plan");

    if (r) {
      try {
        const payload = decodePayload(r);
        const localPlan = localStorage.getItem(`trove_plan_${payload.plan?.id}`);
        const { isUpdate } = importResponsePayload(payload, localPlan ? JSON.parse(localPlan) : undefined);
        message.success(
          isEn
            ? `${isUpdate ? "Updated" : "Added"} ${payload.response.name}'s options.`
            : `Đã ${isUpdate ? "cập nhật" : "thêm"} lựa chọn của ${payload.response.name}.`
        );
        // Drop the long query so a refresh does not re-import
        navigate(`/plans/responses?plan=${encodeURIComponent(payload.plan.id)}`, { replace: true });
        return;
      } catch (e) {
        console.error("Invalid response link", e);
        message.error(isEn ? "This response link is invalid." : "Link phản hồi không hợp lệ.");
      }
    }

    let current: CoordinationData | null = null;
    if (activeId) {
      current = loadCoordination(activeId);
      if (!current) {
        // The host's own plan exists locally but nobody has replied yet
        try {
          const local = localStorage.getItem(`trove_plan_${activeId}`);
          if (local) current = { plan: buildPlanMeta(JSON.parse(local), activeId), responses: [] };
        } catch (e) {}
      }

      // Check if attendees were saved under trove_attendees_${activeId} and auto-merge
      try {
        const rawAttendees = localStorage.getItem(`trove_attendees_${activeId}`);
        if (rawAttendees && current) {
          const attendees = JSON.parse(rawAttendees);
          if (Array.isArray(attendees) && attendees.length > 0) {
            const hostOpts = current.plan.host_options || deriveHostOptions(current.plan);
            const fallbackSlots = hostOpts.slots || [];
            const fallbackPlaces = hostOpts.places || [];

            const guestResponses: GuestResponse[] = attendees.map((att: any, idx: number) => ({
              id: att.id || `att_${idx}_${Date.now()}`,
              name: att.name || `Khách ${idx + 1}`,
              phone: att.phone || undefined,
              isVegetarian: !!att.isVegetarian,
              note: att.note || undefined,
              slots: Array.isArray(att.slots) && att.slots.length > 0 ? att.slots : fallbackSlots,
              places: Array.isArray(att.places) && att.places.length > 0 ? att.places : fallbackPlaces,
              submittedAt: att.joinedAt ? new Date().toISOString() : new Date().toISOString(),
            }));

            const { data: syncedData, changed } = mergeResponses(current.plan, guestResponses);
            if (changed) {
              current = syncedData;
            }
          }
        }
      } catch (e) {
        console.warn("Could not auto-sync attendees from local storage", e);
      }
    }
    setData(current);
    setAllPlans(listCoordinations());
    setLoading(false);
  }, [location.search, isEn, navigate]);

  const persist = (next: CoordinationData) => {
    saveCoordination(next);
    setData(next);
    setAllPlans(listCoordinations());
  };

  /* ----- Actions ----- */
  const handleImport = () => {
    if (!pasteValue.trim()) return;
    try {
      const payload = decodePayload(pasteValue);
      const localPlan = localStorage.getItem(`trove_plan_${payload.plan?.id}`);
      const { data: next, isUpdate } = importResponsePayload(payload, localPlan ? JSON.parse(localPlan) : undefined);
      setPasteValue("");
      navigate(`/plans/responses?plan=${encodeURIComponent(next.plan.id)}`, { replace: true });
      setData(next);
      setAllPlans(listCoordinations());
      message.success(
        isEn
          ? `${isUpdate ? "Updated" : "Added"} ${payload.response.name}'s options.`
          : `Đã ${isUpdate ? "cập nhật" : "thêm"} lựa chọn của ${payload.response.name}.`
      );
    } catch (e) {
      message.error(isEn ? "Invalid link or code. Please check and try again." : "Link hoặc mã không hợp lệ. Vui lòng kiểm tra lại.");
    }
  };

  const handleRemove = (id: string) => {
    if (!data) return;
    persist({ ...data, responses: data.responses.filter((r) => r.id !== id), result: undefined, analyzedAt: undefined });
  };

  const handleAnalyze = async () => {
    if (!data || data.responses.length === 0) return;
    setAnalyzing(true);
    let places: any[] = [];
    try {
      const res: any = await RepositoryManager.places.getPublicPlaces({ per_page: 50 });
      const list = res?.data?.data || res?.data || [];
      places = Array.isArray(list) ? list : [];
    } catch (e) {
      /* places are optional context */
    }

    let result: MergedPlanResult;
    try {
      result = await requestAIMerge({ plan: data.plan, responses: data.responses, slots, places, isEn });
      message.success(isEn ? "AI found a common schedule!" : "AI đã tìm được lịch chung cho cả nhóm!");
    } catch (e) {
      console.error("AI merge failed", e);
      result = buildFallbackResult(data.plan, data.responses, slots, isEn);
      message.warning(
        isEn
          ? "AI is unavailable. Showing the schedule computed from overlapping times."
          : "AI đang không khả dụng. Hiển thị lịch tính trực tiếp từ các khung giờ trùng nhau."
      );
    } finally {
      setAnalyzing(false);
    }
    persist({ ...data, result, analyzedAt: new Date().toISOString() });
  };

  /* ----- Final plan sharing ----- */
  const result = data?.result;

  const finalShareUrl = useMemo(() => {
    if (!data || !result) return "";
    const shared = {
      id: `${data.plan.id}_final`,
      summary: result.summary,
      meeting_vibe: data.plan.meeting_vibe || "",
      meeting_type: data.plan.meeting_type,
      participants: result.chosen.attendees_available.length || data.plan.participants,
      date: result.chosen.date,
      schedule: result.final_schedule,
      general_advice: result.general_advice,
    };
    return `${window.location.origin}/plans/shared?data=${encodePayload(shared)}`;
  }, [data, result]);

  const buildGroupMessage = () => {
    if (!data || !result) return "";
    const head = isEn
      ? `✅ FINAL SCHEDULE: ${result.summary}\n🗓️ ${result.chosen.date} • ${result.chosen.start} - ${result.chosen.end}\n👥 Attending: ${result.chosen.attendees_available.join(", ")}`
      : `✅ LỊCH GẶP MẶT ĐÃ CHỐT: ${result.summary}\n🗓️ ${result.chosen.date} • ${result.chosen.start} - ${result.chosen.end}\n👥 Tham gia: ${result.chosen.attendees_available.join(", ")}`;
    const stops = result.final_schedule
      .map((s, i) => `\n${i + 1}. [${s.time}] ${s.place_name}${s.address ? ` - ${s.address}` : ""}`)
      .join("");
    const missing = result.chosen.attendees_unavailable.length
      ? isEn
        ? `\n⚠️ Cannot attend: ${result.chosen.attendees_unavailable.join(", ")}`
        : `\n⚠️ Chưa tham gia được: ${result.chosen.attendees_unavailable.join(", ")}`
      : "";
    return `${head}\n${stops}${missing}\n\n🔗 ${finalShareUrl}`;
  };

  const getCalendarUrl = () => {
    if (!result) return "#";
    const day = parseDMY(result.chosen.date);
    const title = encodeURIComponent(`Gặp mặt: ${result.summary}`);
    const place = result.final_schedule[0];
    const details = encodeURIComponent(
      result.final_schedule.map((s, i) => `${i + 1}. [${s.time}] ${s.place_name} - ${s.address}`).join("\n") +
        `\n\n${finalShareUrl}`
    );
    const loc = encodeURIComponent(place ? `${place.place_name} ${place.address}` : "");
    let dates = "";
    if (day && /^\d{2}:\d{2}$/.test(result.chosen.start) && /^\d{2}:\d{2}$/.test(result.chosen.end)) {
      const d = day.format("YYYYMMDD");
      dates = `&dates=${d}T${result.chosen.start.replace(":", "")}00/${d}T${result.chosen.end.replace(":", "")}00`;
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}${dates}`;
  };

  const copy = (text: string, ok: string) => {
    navigator.clipboard.writeText(text);
    message.success(ok);
  };

  /* ----- Render ----- */
  const header = (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-[#E6B000] bg-clip-text text-transparent font-display">
            TROVE
          </span>
          <span className="text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
            {isEn ? "Group Responses" : "Phản hồi của nhóm"}
          </span>
        </Link>
        <button
          onClick={() => setLanguage(isEn ? "vn" : "en")}
          className="text-xs font-black px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <i className="fa-solid fa-globe text-amber-500" />
          <span>{isEn ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}</span>
        </button>
      </div>
    </header>
  );

  const importCard = (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#FF9F1C] flex items-center justify-center text-sm">
          <i className="fa-solid fa-inbox" />
        </span>
        <div>
          <h2 className="text-sm font-black text-black dark:text-white">
            {isEn ? "Add a response from a guest" : "Thêm phản hồi từ thành viên"}
          </h2>
          <p className="text-[11px] text-gray-500 font-medium">
            {isEn
              ? "Opening a guest's response link adds it automatically. You can also paste the link here."
              : "Mở link phản hồi của thành viên là tự động được thêm. Bạn cũng có thể dán link vào đây."}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          onPressEnter={handleImport}
          placeholder={isEn ? "Paste response link..." : "Dán link phản hồi..."}
          className="rounded-xl text-xs"
        />
        <Button
          type="primary"
          onClick={handleImport}
          className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black text-xs rounded-xl h-auto px-4 flex items-center gap-1.5"
        >
          <i className="fa-solid fa-plus" />
          {isEn ? "Add" : "Thêm"}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans">
        <i className="fa-solid fa-wand-magic-sparkles text-3xl text-amber-500 animate-spin" />
      </div>
    );
  }

  // No plan selected / found -> show host's known plans + paste box
  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20">
        {header}
        <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center text-2xl mx-auto">
              <i className="fa-solid fa-people-group" />
            </div>
            <h1 className="text-xl font-black text-black dark:text-white">
              {isEn ? "Group schedule responses" : "Phản hồi lịch của nhóm"}
            </h1>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {isEn
                ? "Open a plan below, or paste a response link sent by your guests."
                : "Chọn một kế hoạch bên dưới, hoặc dán link phản hồi mà thành viên đã gửi cho bạn."}
            </p>
          </div>
          {importCard}
          {allPlans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-500">
                {isEn ? "Your plans with responses" : "Kế hoạch đã có phản hồi"}
              </h2>
              {allPlans.map((p) => (
                <Link
                  key={p.plan.id}
                  to={`/plans/responses?plan=${encodeURIComponent(p.plan.id)}`}
                  className="block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
                >
                  <div className="text-sm font-black text-black dark:text-white">{p.plan.summary || p.plan.id}</div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-1">
                    <i className="fa-solid fa-users text-amber-500 mr-1" />
                    {p.responses.length} {isEn ? "responses" : "phản hồi"}
                    {p.result && (
                      <span className="ml-2 text-emerald-600">
                        <i className="fa-solid fa-circle-check mr-1" />
                        {isEn ? "Schedule ready" : "Đã có lịch chung"}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  const { plan, responses } = data;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20">
      {header}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-amber-500 to-[#FF9F1C] p-8 text-black shadow-xl">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                {isEn ? "Host dashboard" : "Bảng điều khiển người tạo"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                <i className="fa-solid fa-users mr-1" />
                {responses.length}
                {plan.participants ? `/${plan.participants}` : ""} {isEn ? "responded" : "đã phản hồi"}
              </span>
              {plan.date && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                  <i className="fa-solid fa-calendar mr-1" />
                  {plan.date}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug font-display">
              {plan.summary || (isEn ? "Group meetup" : "Kế hoạch gặp mặt nhóm")}
            </h1>
            <p className="text-xs font-bold opacity-90">
              {isEn
                ? "AI compares everyone's place & time options and builds one itinerary for the whole group."
                : "AI so sánh địa điểm & thời gian của mọi người và lập một lịch trình chung cho cả nhóm."}
            </p>
          </div>
          <i className="fa-solid fa-calendar-check absolute -right-4 -bottom-6 text-9xl text-black/10 pointer-events-none" />
        </div>

        {importCard}

        {/* Responses */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2 font-display">
            <i className="fa-solid fa-user-clock text-amber-500" />
            {isEn ? "Members' options" : "Lựa chọn của từng thành viên"}
          </h2>

          {responses.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-dashed border-amber-300 dark:border-amber-800 rounded-3xl p-8 text-center space-y-2">
              <i className="fa-solid fa-hourglass-half text-2xl text-amber-400" />
              <p className="text-sm font-black text-black dark:text-white">
                {isEn ? "No responses yet" : "Chưa có phản hồi nào"}
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {isEn
                  ? "Share the invite link. After each guest picks their options they send you a response link — open it to add them here."
                  : "Hãy gửi link mời. Sau khi chọn lịch, mỗi thành viên sẽ gửi lại cho bạn một link phản hồi — mở link đó để thêm vào đây."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responses.map((resp) => (
                <div
                  key={resp.id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-sm shrink-0">
                        {resp.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-black dark:text-white truncate">{resp.name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">
                          {dayjs(resp.submittedAt).format("HH:mm DD/MM")}
                          {resp.phone ? ` • ${resp.phone}` : ""}
                        </div>
                      </div>
                    </div>
                    <Popconfirm
                      title={isEn ? "Remove this response?" : "Xoá phản hồi này?"}
                      okText={isEn ? "Remove" : "Xoá"}
                      cancelText={isEn ? "Cancel" : "Huỷ"}
                      onConfirm={() => handleRemove(resp.id)}
                    >
                      <button className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer" aria-label="remove">
                        <i className="fa-solid fa-trash-can text-xs" />
                      </button>
                    </Popconfirm>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {resp.isVegetarian && (
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        🌱 {isEn ? "Vegetarian" : "Ăn chay"}
                      </span>
                    )}
                    {resp.note && (
                      <span className="text-[10px] italic text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {resp.note}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        <i className="fa-solid fa-clock text-amber-500 mr-1" />
                        {isEn ? "Available slots:" : "Khung giờ đi được:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(resp.slots || []).map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg"
                          >
                            {formatDateDisplay(s.date)} • {s.start}-{s.end}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        <i className="fa-solid fa-location-dot text-red-500 mr-1" />
                        {isEn ? "Preferred places:" : "Địa điểm yêu thích:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(resp.places || []).map((p, i) => (
                          <span
                            key={i}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                              p.is_new
                                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {p.name}
                            {p.is_new && <span className="ml-1 text-[9px] text-blue-500 font-normal">({isEn ? "suggested" : "đề xuất"})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pre-computed overlaps + AI trigger */}
        {responses.length > 0 && (
          <section className="bg-white dark:bg-gray-900 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 shadow-md space-y-5">
            <div>
              <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2 font-display">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-500" />
                {isEn ? "Find a common schedule" : "Tìm lịch chung cho cả nhóm"}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {isEn
                  ? "Time windows where the most people overlap are computed first, then the AI picks the venue and builds the itinerary."
                  : "Hệ thống tính trước các khung giờ nhiều người trùng nhất, sau đó AI chọn địa điểm và lập lịch trình cụ thể."}
              </p>
            </div>

            {slots.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider block">
                  {isEn ? "Best overlapping windows" : "Khung giờ trùng nhiều nhất"}
                </span>
                {slots.slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-850 px-4 py-2.5"
                  >
                    <div className="text-xs font-black text-black dark:text-white">
                      <i className="fa-solid fa-calendar-day text-amber-500 mr-1.5" />
                      {formatDateDisplay(s.date)} • {s.start} - {s.end}
                      {s.places[0] && (
                        <span className="ml-2 font-semibold text-gray-500">
                          <i className="fa-solid fa-location-dot text-red-400 mr-1" />
                          {s.places[0].name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                        s.attendeeIds.length === responses.length
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                      }`}
                      title={s.attendeeNames.join(", ")}
                    >
                      {s.attendeeIds.length}/{responses.length} {isEn ? "people" : "người"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-rose-600">
                {isEn ? "No time window overlaps between these options yet." : "Chưa có khung giờ nào trùng nhau giữa các lựa chọn."}
              </p>
            )}

            <Button
              type="primary"
              onClick={handleAnalyze}
              loading={analyzing}
              className="w-full bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-amber-500 hover:opacity-95 text-black border-none font-black py-3.5 rounded-2xl h-auto text-sm shadow-[0_8px_25px_rgba(255,159,28,0.3)] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-wand-magic-sparkles" />
              <span>
                {result
                  ? isEn ? "Re-run AI scheduling" : "Chạy lại AI tổng hợp lịch"
                  : isEn ? "Let AI build the group schedule" : "AI tổng hợp & lập lịch trình chung"}
              </span>
            </Button>
          </section>
        )}

        {/* AI result */}
        {result && (
          <section className="space-y-6">
            {result.isFallback && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation" />
                {isEn
                  ? "Generated locally from overlapping times (AI was unavailable). Re-run AI for a richer itinerary."
                  : "Lịch này được tính trực tiếp từ các khung giờ trùng (AI không khả dụng). Hãy chạy lại AI để có lịch trình chi tiết hơn."}
              </div>
            )}

            {/* Chosen slot */}
            <div className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                <i className="fa-solid fa-circle-check mr-1" />
                {isEn ? "Final schedule" : "Lịch đã chốt"}
              </span>
              <h2 className="text-2xl font-black font-display leading-snug">{result.summary}</h2>
              <div className="flex flex-wrap gap-2 text-xs font-black">
                <span className="bg-white/20 px-3 py-1.5 rounded-xl">
                  <i className="fa-solid fa-calendar mr-1.5" />
                  {result.chosen.date}
                </span>
                {result.chosen.start && (
                  <span className="bg-white/20 px-3 py-1.5 rounded-xl">
                    <i className="fa-solid fa-clock mr-1.5" />
                    {result.chosen.start} - {result.chosen.end}
                  </span>
                )}
                <span className="bg-white/20 px-3 py-1.5 rounded-xl">
                  <i className="fa-solid fa-users mr-1.5" />
                  {result.chosen.attendees_available.length}/{responses.length} {isEn ? "people" : "người"}
                </span>
              </div>
              {result.chosen.reason && <p className="text-xs font-medium leading-relaxed opacity-95">{result.chosen.reason}</p>}
            </div>

            {/* Itinerary */}
            {result.final_schedule.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2 font-display">
                  <i className="fa-solid fa-route text-amber-500" />
                  {isEn ? "Detailed itinerary" : "Lịch trình cụ thể"}
                </h3>
                {result.final_schedule.map((stop, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-md space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#FF9F1C] font-black flex items-center justify-center text-sm shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-500 block">{stop.activity_type}</span>
                          <h4 className="text-lg font-black text-black dark:text-white">{stop.place_name}</h4>
                          {stop.address && (
                            <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                              <i className="fa-solid fa-location-dot text-red-500 text-[11px]" />
                              {stop.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl">
                          <i className="fa-solid fa-clock text-amber-500 text-[11px]" />
                          {stop.time}
                        </span>
                        {stop.estimated_cost && <span className="text-[11px] font-bold text-gray-500">{stop.estimated_cost}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {stop.vegetarian_status && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                            stop.vegetarian_friendly
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <i className={`fa-solid ${stop.vegetarian_friendly ? "fa-leaf text-emerald-500" : "fa-ban text-gray-400"}`} />
                          {stop.vegetarian_status}
                        </span>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.place_name} ${stop.address}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        <i className="fa-solid fa-diamond-turn-right text-blue-500" />
                        Google Maps
                      </a>
                    </div>

                    {stop.why_suitable && (
                      <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 font-medium">
                        <span className="font-bold text-amber-700 dark:text-amber-400 mr-1">
                          {isEn ? "🎯 Why this place:" : "🎯 Vì sao chọn:"}
                        </span>
                        {stop.why_suitable}
                      </div>
                    )}

                    {(stop.pros.length > 0 || stop.cons.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stop.pros.length > 0 && (
                          <ul className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3 space-y-1">
                            {stop.pros.map((p, i) => (
                              <li key={i} className="text-xs text-emerald-900 dark:text-emerald-200 font-medium flex gap-2">
                                <span className="text-emerald-500 font-bold">•</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        )}
                        {stop.cons.length > 0 && (
                          <ul className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3 space-y-1">
                            {stop.cons.map((c, i) => (
                              <li key={i} className="text-xs text-rose-900 dark:text-rose-200 font-medium flex gap-2">
                                <span className="text-rose-500 font-bold">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Attendee fit */}
            {result.attendee_fit.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-user-check text-amber-500" />
                  {isEn ? "Who can attend" : "Ai tham gia được"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.attendee_fit.map((f, i) => {
                    const style = FIT_STYLES[f.status] || FIT_STYLES.no_fit;
                    return (
                      <div key={i} className={`rounded-2xl border px-3 py-2 text-xs ${style.box}`}>
                        <div className="font-black flex items-center gap-1.5">
                          <i className={`fa-solid ${style.icon}`} />
                          {f.name}
                          <span className="font-semibold opacity-80">• {isEn ? style.label.en : style.label.vn}</span>
                        </div>
                        {f.note && <div className="mt-0.5 font-medium opacity-90">{f.note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conflicts */}
            {result.conflicts.length > 0 && (
              <div className="bg-rose-50/60 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5 space-y-2">
                <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation" />
                  {isEn ? "Could not be satisfied" : "Chưa đáp ứng được"}
                </span>
                <ul className="space-y-1">
                  {result.conflicts.map((c, i) => (
                    <li key={i} className="text-xs text-rose-900 dark:text-rose-200 font-medium flex gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-shuffle text-amber-500" />
                  {isEn ? "Backup options" : "Phương án dự phòng"}
                </h3>
                {result.alternatives.map((a, i) => (
                  <div key={i} className="rounded-2xl bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-xs space-y-0.5">
                    <div className="font-black text-black dark:text-white">
                      {a.date} • {a.time} {a.place_name && `• ${a.place_name}`}
                    </div>
                    <div className="text-gray-500 font-semibold">
                      {(a.attendees || []).join(", ")}
                      {a.note ? ` — ${a.note}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.general_advice && (
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex items-start gap-3">
                <i className="fa-solid fa-lightbulb text-blue-500 text-lg mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                    {isEn ? "Advice for the host" : "Lời khuyên cho người tạo"}
                  </span>
                  <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">{result.general_advice}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                type="primary"
                onClick={() => copy(buildGroupMessage(), isEn ? "Final schedule copied for your group chat!" : "Đã sao chép lịch chốt để gửi vào nhóm chat!")}
                className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black py-3 rounded-2xl h-auto text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <i className="fa-solid fa-paper-plane" />
                {isEn ? "Copy to send to group" : "Sao chép gửi cả nhóm"}
              </Button>
              <a
                href={finalShareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs shadow-sm"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" />
                {isEn ? "Open final plan page" : "Mở trang kế hoạch chốt"}
              </a>
              <a
                href={getCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-xs shadow-sm"
              >
                <i className="fa-solid fa-calendar-plus" />
                Google Calendar
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
