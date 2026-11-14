import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Checkbox, message, Tag, AutoComplete } from "antd";
import { useLocation, Link } from "react-router-dom";
import dayjs from "dayjs";
import useLanguageStore from "../../stores/languageStore.ts";
import RepositoryManager from "../../data/repositoryManager";
import {
  GuestResponse,
  HostOptions,
  PlaceRef,
  ResponsePayload,
  TimeSlot,
  MAX_EXTRA_PLACES,
  buildPlanMeta,
  buildResponseUrl,
  deriveHostOptions,
  formatDateDisplay,
  getOrCreateGuestKey,
  loadGuestProfile,
  makeResponseId,
  normalizePhone,
  saveGuestProfile,
  slotKey,
  submitResponseRemote,
  mergeResponses,
} from "./planCoordination.ts";

interface Attendee {
  id: string;
  name: string;
  phone?: string;
  isVegetarian: boolean;
  note?: string;
  joinedAt: string;
  slots?: TimeSlot[];
  places?: PlaceRef[];
}

interface Submission {
  response: GuestResponse;
  /** Fallback link the guest can send to the host when the server could not store the response */
  url: string;
  /** true once the response reached the server (and therefore the host) */
  delivered?: boolean;
}

interface PlanStop {
  time: string;
  activity_type: string;
  place_name: string;
  address: string;
  estimated_cost: string;
  vegetarian_friendly: boolean;
  vegetarian_status: string;
  why_suitable: string;
  pros: string[];
  cons: string[];
}

interface SharedPlanData {
  id?: string;
  summary: string;
  meeting_vibe: string;
  meeting_type?: string;
  participants: number;
  date: string;
  schedule: PlanStop[];
  general_advice?: string;
  created_by?: string;
  /** Places and time windows the plan host can attend; guests choose among them */
  host_options?: HostOptions;
}

export default function SharedPlanView() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const isEn = currentLanguage === "en";
  const location = useLocation();
  const [planData, setPlanData] = useState<SharedPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Attendee registration state
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [attendeeNote, setAttendeeNote] = useState("");
  const [attendeesList, setAttendeesList] = useState<Attendee[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isPlanSavedLocally, setIsPlanSavedLocally] = useState(false);

  // Unique key for this plan's attendees in localStorage
  const [planKey, setPlanKey] = useState("trove_shared_plan_default");

  // Group scheduling: guests choose among the host's time windows and places
  const [coordPlanId, setCoordPlanId] = useState("default");
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<string[]>([]);
  const [selectedPlaceNames, setSelectedPlaceNames] = useState<string[]>([]);
  const [extraPlaces, setExtraPlaces] = useState<PlaceRef[]>([]);
  const [extraInput, setExtraInput] = useState("");
  const [extraMeta, setExtraMeta] = useState<{ placeId?: number; address?: string }>({});
  const [systemPlaces, setSystemPlaces] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options defined by the host (older shared links derive them from the itinerary)
  const hostOptions = useMemo<HostOptions>(
    () => (planData ? deriveHostOptions(planData) : { places: [], slots: [] }),
    [planData]
  );

  // Autocomplete suggestions for places a guest may add: places on Trove that the host did not list
  const placeSuggestions = useMemo(() => {
    const hostNames = new Set(hostOptions.places.map((p) => p.name));
    return systemPlaces
      .filter((p) => p?.name && !hostNames.has(p.name))
      .map((p) => ({ value: p.name, label: p.name, placeId: Number(p.id), address: p.address }));
  }, [hostOptions, systemPlaces]);

  useEffect(() => {
    // Public places are optional suggestions; guests can always type a place freely
    RepositoryManager.places
      .getPublicPlaces({ per_page: 80 })
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        setSystemPlaces(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get("data");
      const planId = params.get("id");

      let parsed: SharedPlanData | null = null;

      if (encodedData) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encodedData))));
          parsed = JSON.parse(jsonStr);
        } catch (e) {
          console.warn("Base64 decode failed, trying standard decodeURIComponent", e);
          const jsonStr = decodeURIComponent(encodedData);
          parsed = JSON.parse(jsonStr);
        }
      } else if (planId) {
        const saved = localStorage.getItem(`trove_plan_${planId}`);
        if (saved) {
          parsed = JSON.parse(saved);
        }
      }

      if (parsed) {
        setPlanData(parsed);
        const stableId = String(parsed.id || planId || encodeURIComponent(parsed.summary || "plan"));
        const key = `trove_attendees_${stableId}`;
        setPlanKey(key);
        setCoordPlanId(stableId);

        // Prefill name/phone from what this device used last time (avoids typos)
        const profile = loadGuestProfile();
        if (profile) {
          setAttendeeName(profile.name || "");
          setAttendeePhone(profile.phone || "");
        }

        // Restore the response this guest already submitted for this plan (if any)
        try {
          const mine = localStorage.getItem(`trove_my_response_${stableId}`);
          if (mine) {
            const sub: Submission = JSON.parse(mine);
            if (Array.isArray(sub?.response?.slots) && Array.isArray(sub?.response?.places)) {
              setSubmitted(sub);
              setAttendeeName(sub.response.name || "");
              setAttendeePhone(sub.response.phone || "");
              setAttendeeNote(sub.response.note || "");
              setIsVegetarian(!!sub.response.isVegetarian);
              setSelectedSlotKeys(sub.response.slots.map(slotKey));
              setSelectedPlaceNames(sub.response.places.filter((p) => !p.is_new).map((p) => p.name));
              setExtraPlaces(sub.response.places.filter((p) => p.is_new));
            }
          }
        } catch (e) {}

        // Load attendees from localStorage
        const savedAttendees = localStorage.getItem(key);
        if (savedAttendees) {
          const list = JSON.parse(savedAttendees);
          setAttendeesList(Array.isArray(list) ? list : []);
        }

        // Check if plan is saved locally
        const guestSaved = localStorage.getItem("trove_guest_saved_plans");
        if (guestSaved) {
          try {
            const list = JSON.parse(guestSaved);
            if (Array.isArray(list) && list.some((p: any) => p.id === parsed?.id || p.summary === parsed?.summary)) {
              setIsPlanSavedLocally(true);
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Failed to parse shared plan data:", err);
      message.error("Không thể đọc thông tin kế hoạch được chia sẻ.");
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  const handleSavePlanLocally = () => {
    if (!planData) return;
    try {
      const guestSaved = localStorage.getItem("trove_guest_saved_plans");
      const list = guestSaved ? JSON.parse(guestSaved) : [];
      const updated = [
        planData,
        ...list.filter((p: any) => p.id !== planData.id && p.summary !== planData.summary),
      ];
      localStorage.setItem("trove_guest_saved_plans", JSON.stringify(updated));
      setIsPlanSavedLocally(true);
      message.success("🎉 Đã lưu kế hoạch vào thiết bị của bạn thành công (Không cần đăng nhập)!");
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi lưu kế hoạch vào thiết bị.");
    }
  };

  const toggleSlot = (key: string) =>
    setSelectedSlotKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const togglePlace = (name: string) =>
    setSelectedPlaceNames((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const addExtraPlace = () => {
    const name = extraInput.trim();
    if (!name) return;
    const lower = name.toLowerCase();
    // Typing a place the host already listed just ticks it
    const hostMatch = hostOptions.places.find((p) => p.name.toLowerCase() === lower);
    if (hostMatch) {
      setSelectedPlaceNames((prev) => (prev.includes(hostMatch.name) ? prev : [...prev, hostMatch.name]));
    } else if (extraPlaces.some((p) => p.name.toLowerCase() === lower)) {
      message.info(isEn ? "You already added this place." : "Bạn đã thêm địa điểm này rồi.");
    } else if (extraPlaces.length >= MAX_EXTRA_PLACES) {
      message.warning(
        isEn ? `You can suggest up to ${MAX_EXTRA_PLACES} extra places.` : `Bạn chỉ đề xuất thêm tối đa ${MAX_EXTRA_PLACES} địa điểm.`
      );
      return;
    } else {
      setExtraPlaces((prev) => [...prev, { name, place_id: extraMeta.placeId, address: extraMeta.address, is_new: true }]);
    }
    setExtraInput("");
    setExtraMeta({});
  };

  const handleCopy = (text: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    message.success(successMsg);
  };

  const buildHostMessage = (response: GuestResponse, url: string) => {
    const slotLines = response.slots.map((s) => `• ${formatDateDisplay(s.date)} ${s.start}-${s.end}`).join("\n");
    const placeLines = response.places.map((p) => `• ${p.name}`).join("\n");
    return isEn
      ? `Hi, I'm ${response.name}. For "${planData?.summary || "our meetup"}" I can attend:\n${slotLines}\nPlaces I like:\n${placeLines}\n\nOpen this link to add me to the group schedule:\n${url}`
      : `Mình là ${response.name}. Với kế hoạch "${planData?.summary || "gặp mặt"}" mình đi được:\n${slotLines}\nĐịa điểm mình thích:\n${placeLines}\n\nMở link này để thêm mình vào lịch chung của nhóm:\n${url}`;
  };

  const buildPayload = (response: GuestResponse): ResponsePayload => ({
    v: 2,
    plan: buildPlanMeta({ ...planData, id: coordPlanId, host_options: hostOptions }, coordPlanId),
    response,
  });

  // Retry delivering a response that could not reach the server the first time
  const handleRetrySend = async () => {
    if (!submitted) return;
    setIsSubmitting(true);
    const ok = await submitResponseRemote(buildPayload(submitted.response));
    setIsSubmitting(false);
    const next: Submission = { ...submitted, delivered: ok };
    setSubmitted(next);
    localStorage.setItem(`trove_my_response_${coordPlanId}`, JSON.stringify(next));
    if (ok) message.success(isEn ? "Sent to the plan host!" : "Đã gửi cho người tạo kế hoạch!");
    else message.warning(isEn ? "Still cannot reach the server. Please use the link below." : "Vẫn chưa kết nối được máy chủ. Bạn hãy gửi link bên dưới.");
  };

  const handleJoinPlan = async () => {
    if (!attendeeName.trim()) {
      message.warning("Vui lòng nhập tên của bạn để xác nhận tham gia!");
      return;
    }

    const phone = normalizePhone(attendeePhone);
    if (phone === null) {
      message.warning(
        isEn
          ? "The phone number looks wrong. Please check it (e.g. 0901234567)."
          : "Số điện thoại chưa đúng. Vui lòng kiểm tra lại (ví dụ: 0901234567)."
      );
      return;
    }

    const slots = hostOptions.slots.filter((s) => selectedSlotKeys.includes(slotKey(s)));
    if (slots.length === 0) {
      message.warning(
        isEn ? "Please tick at least one time window you can attend." : "Vui lòng chọn ít nhất một khung giờ bạn đi được."
      );
      return;
    }
    const places: PlaceRef[] = [
      ...hostOptions.places.filter((p) => selectedPlaceNames.includes(p.name)),
      ...extraPlaces,
    ];
    if (places.length === 0) {
      message.warning(
        isEn ? "Please choose at least one place (or suggest your own)." : "Vui lòng chọn ít nhất một địa điểm (hoặc đề xuất địa điểm của bạn)."
      );
      return;
    }

    const response: GuestResponse = {
      id: makeResponseId(getOrCreateGuestKey(), attendeeName),
      name: attendeeName.trim(),
      phone: phone || undefined,
      isVegetarian,
      note: attendeeNote.trim() || undefined,
      slots,
      places,
      submittedAt: new Date().toISOString(),
    };
    const payload = buildPayload(response);

    // Send to the server so the host receives it automatically; the link is only a fallback
    setIsSubmitting(true);
    const delivered = await submitResponseRemote(payload);
    setIsSubmitting(false);

    const submission: Submission = { response, url: buildResponseUrl(payload), delivered };
    setSubmitted(submission);
    localStorage.setItem(`trove_my_response_${coordPlanId}`, JSON.stringify(submission));
    saveGuestProfile({ name: response.name, phone: phone || "" });

    // Save directly into local coordination so if the user is on the same machine/browser,
    // the host dashboard immediately sees the responses without needing server or paste.
    try {
      mergeResponses(payload.plan, [response]);
    } catch (e) {
      console.warn("Could not merge response locally", e);
    }

    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: attendeeName.trim(),
      phone: attendeePhone.trim(),
      isVegetarian,
      note: attendeeNote.trim(),
      joinedAt: dayjs().format("HH:mm DD/MM"),
      slots,
      places,
    };

    const updatedList = [newAttendee, ...attendeesList];
    setAttendeesList(updatedList);
    localStorage.setItem(planKey, JSON.stringify(updatedList));

    // Also automatically save the plan into guest's local storage
    if (planData) {
      try {
        const guestSaved = localStorage.getItem("trove_guest_saved_plans");
        const list = guestSaved ? JSON.parse(guestSaved) : [];
        const updated = [
          planData,
          ...list.filter((p: any) => p.id !== planData.id && p.summary !== planData.summary),
        ];
        localStorage.setItem("trove_guest_saved_plans", JSON.stringify(updated));
        setIsPlanSavedLocally(true);
      } catch (e) {}
    }

    setHasJoined(true);
    message.success(
      delivered
        ? isEn
          ? "🎉 Sent! The plan host has received your options."
          : "🎉 Đã gửi! Người tạo kế hoạch đã nhận được lựa chọn của bạn."
        : isEn
          ? "🎉 Saved! Please send the link below to the plan host."
          : "🎉 Đã lưu! Hãy gửi link bên dưới cho người tạo kế hoạch."
    );
  };

  const getGoogleCalendarUrl = () => {
    if (!planData) return "#";
    const title = encodeURIComponent(`Gặp mặt: ${planData.summary || "Kế hoạch nhóm Trove"}`);
    const details = encodeURIComponent(
      `Lịch trình gặp mặt cùng nhóm:\n` +
      planData.schedule.map((s, idx) => `${idx + 1}. [${s.time}] ${s.place_name} - ${s.address}`).join("\n") +
      `\n\nXem chi tiết tại: ${window.location.href}`
    );
    const locationStr = encodeURIComponent(planData.schedule[0]?.address || "Đà Nẵng");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${locationStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans">
        <div className="text-center space-y-3">
          <i className="fa-solid fa-wand-magic-sparkles text-3xl text-amber-500 animate-spin" />
          <p className="text-sm font-bold text-gray-500">Đang tải kế hoạch gặp mặt...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 font-sans px-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center text-2xl mx-auto">
            <i className="fa-solid fa-map-location-dot" />
          </div>
          <h2 className="text-xl font-black text-black dark:text-white">Không tìm thấy kế hoạch</h2>
          <p className="text-xs text-gray-500">
            Liên kết có thể đã hết hạn hoặc thông tin không chính xác. Bạn có thể tự tạo kế hoạch mới trên Trove.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black px-6 py-3 rounded-2xl text-xs shadow-md transition-transform hover:scale-105"
          >
            <i className="fa-solid fa-house" />
            <span>Về trang chủ Trove</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 pb-20">
      {/* Top Header Bar */}
      <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-[#E6B000] bg-clip-text text-transparent font-display">
              TROVE
            </span>
            <span className="text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
              {isEn ? "Shared Plan" : "Kế hoạch chung"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(isEn ? "vn" : "en")}
              className="text-xs font-black px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-globe text-amber-500" />
              <span>{isEn ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}</span>
            </button>
            <Button
              onClick={handleSavePlanLocally}
              className={`text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                isPlanSavedLocally
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 hover:border-amber-400"
              }`}
            >
              <i className={`fa-solid ${isPlanSavedLocally ? "fa-circle-check text-emerald-500" : "fa-bookmark text-amber-500"}`} />
              <span>{isPlanSavedLocally ? (isEn ? "Saved to Device" : "Đã lưu vào máy") : (isEn ? "Save to Device" : "Lưu kế hoạch vào máy")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        {/* Invitation Hero Card */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-amber-500 to-[#FF9F1C] p-8 text-black shadow-xl">
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                {isEn ? "Group Meetup Invitation" : "Lời mời tham gia gặp mặt"}
              </span>
              {planData.date && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                  <i className="fa-solid fa-calendar mr-1" />
                  {planData.date}
                </span>
              )}
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                <i className="fa-solid fa-users mr-1" />
                {isEn ? `Expected ${planData.participants} attendees` : `Dự kiến ${planData.participants} người`}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug font-display">
              {planData.summary}
            </h1>

            {planData.meeting_vibe && (
              <p className="text-xs font-bold opacity-90 flex items-center gap-1.5">
                <i className="fa-solid fa-sparkles" />
                {isEn ? "Meeting vibe:" : "Không khí buổi gặp:"} <span className="font-black underline">{planData.meeting_vibe}</span>
              </p>
            )}
          </div>
          <i className="fa-solid fa-people-group absolute -right-6 -bottom-6 text-9xl text-black/10 pointer-events-none" />
        </div>

        {/* SECTION: THAM GIA CHUNG (RSVP FORM) - NO LOGIN REQUIRED */}
        <div className="bg-white dark:bg-gray-900 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500" />
                {isEn ? "RSVP & Join Group Plan" : "Xác Nhận Tham Gia Cùng Nhóm"}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {isEn
                  ? "No login required! Just enter your name so the group host knows you are coming."
                  : "Không cần đăng nhập tài khoản. Chỉ cần nhập tên của bạn để người tạo kế hoạch biết số lượng!"}
              </p>
            </div>
            <span className="text-xs font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {isEn ? `${attendeesList.length} confirmed` : `Đã có ${attendeesList.length} người xác nhận`}
            </span>
          </div>

          {/* Registration Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isEn ? "Your Name" : "Tên của bạn"} <span className="text-red-500">*</span>:
              </label>
              <Input
                name="name"
                autoComplete="name"
                placeholder={isEn ? "e.g. Alex, Sarah..." : "Ví dụ: Minh Tuấn, Lan Anh..."}
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                className="rounded-xl py-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isEn ? "Phone / Contact (Optional):" : "Số ĐT / Zalo (Tùy chọn):"}
              </label>
              <Input
                name="tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={isEn ? "e.g. 0901234567" : "Ví dụ: 0901234567"}
                value={attendeePhone}
                onChange={(e) => setAttendeePhone(e.target.value)}
                className="rounded-xl py-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isEn ? "Note for the group:" : "Ghi chú cho nhóm:"}
              </label>
              <Input
                placeholder={isEn ? "e.g. Arriving on time, by taxi..." : "Ví dụ: Đi xe máy, tới đúng giờ..."}
                value={attendeeNote}
                onChange={(e) => setAttendeeNote(e.target.value)}
                className="rounded-xl py-2 text-xs"
              />
            </div>
          </div>

          {/* Choose among the host's time windows and places */}
          <div className="space-y-5 pt-1">
            <div>
              <span className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-check text-amber-500" />
                {isEn ? "Pick the times you can attend & the places you like" : "Chọn thời gian bạn đi được & địa điểm bạn thích"}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {isEn
                  ? "These are the options the plan host can attend. AI will find the slot that fits most people and send the final itinerary to the host."
                  : "Đây là các khung giờ và địa điểm người tạo kế hoạch có thể đi. AI sẽ tìm lịch nhiều người trùng nhất rồi trả lịch trình cụ thể cho người tạo."}
              </p>
            </div>

            {/* Time windows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <i className="fa-solid fa-clock text-amber-500 mr-1.5" />
                  {isEn ? "Time windows (tick all that work for you)" : "Khung giờ (chọn tất cả khung bạn đi được)"}
                </span>
                <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full">
                  {selectedSlotKeys.length}/{hostOptions.slots.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hostOptions.slots.map((slot) => {
                  const key = slotKey(slot);
                  const active = selectedSlotKeys.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleSlot(key)}
                      className={`flex items-center gap-3 text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        active
                          ? "bg-amber-50 dark:bg-amber-950/25 border-[#FFCB37] shadow-sm"
                          : "bg-gray-50/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-amber-300"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${
                          active ? "bg-[#FFCB37] border-[#FFCB37] text-black" : "bg-white dark:bg-gray-900 border-gray-300 text-transparent"
                        }`}
                      >
                        <i className="fa-solid fa-check" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-black dark:text-white">
                          <i className="fa-solid fa-calendar text-amber-500 mr-1.5" />
                          {formatDateDisplay(slot.date)}
                        </span>
                        <span className="block text-[11px] font-bold text-gray-500 mt-0.5">
                          <i className="fa-solid fa-clock text-amber-500 mr-1.5" />
                          {slot.start} - {slot.end}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Places */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <i className="fa-solid fa-location-dot text-red-500 mr-1.5" />
                  {isEn ? "Places (tick the ones you like)" : "Địa điểm (chọn nơi bạn muốn đến)"}
                </span>
                <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full">
                  {selectedPlaceNames.length + extraPlaces.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {hostOptions.places.map((place) => {
                  const active = selectedPlaceNames.includes(place.name);
                  return (
                    <button
                      key={place.name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePlace(place.name)}
                      className={`flex items-center gap-3 text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        active
                          ? "bg-amber-50 dark:bg-amber-950/25 border-[#FFCB37] shadow-sm"
                          : "bg-gray-50/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-amber-300"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] shrink-0 ${
                          active ? "bg-[#FFCB37] border-[#FFCB37] text-black" : "bg-white dark:bg-gray-900 border-gray-300 text-transparent"
                        }`}
                      >
                        <i className="fa-solid fa-check" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-black text-black dark:text-white truncate">{place.name}</span>
                        {place.address && (
                          <span className="block text-[11px] font-medium text-gray-500 truncate">{place.address}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Guest-suggested places */}
              {extraPlaces.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extraPlaces.map((p) => (
                    <span
                      key={p.name}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full pl-3 pr-2 py-1"
                    >
                      <i className="fa-solid fa-lightbulb text-[10px]" />
                      {p.name}
                      <button
                        type="button"
                        aria-label="remove"
                        onClick={() => setExtraPlaces((prev) => prev.filter((x) => x.name !== p.name))}
                        className="w-4 h-4 rounded-full hover:bg-blue-200/60 dark:hover:bg-blue-800/60 flex items-center justify-center cursor-pointer"
                      >
                        <i className="fa-solid fa-xmark text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <AutoComplete
                  className="flex-1"
                  value={extraInput}
                  options={placeSuggestions}
                  placeholder={isEn ? "Suggest another place..." : "Đề xuất thêm địa điểm khác..."}
                  filterOption={(input, option: any) =>
                    String(option?.value || "").toLowerCase().includes(input.toLowerCase())
                  }
                  onSelect={(value: string, option: any) => {
                    setExtraInput(value);
                    setExtraMeta({ placeId: option?.placeId, address: option?.address });
                  }}
                  onChange={(value: string) => {
                    setExtraInput(value);
                    setExtraMeta({});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addExtraPlace();
                    }
                  }}
                />
                <Button
                  onClick={addExtraPlace}
                  className="rounded-xl text-xs font-black border-amber-300 text-amber-700 dark:text-amber-400 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus" />
                  {isEn ? "Add" : "Thêm"}
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span>
                  {isEn
                    ? `You can suggest up to ${MAX_EXTRA_PLACES} extra places.`
                    : `Bạn có thể đề xuất thêm tối đa ${MAX_EXTRA_PLACES} địa điểm.`}
                </span>
                <span className={extraPlaces.length >= MAX_EXTRA_PLACES ? "text-amber-600 font-bold" : "text-gray-400"}>
                  {extraPlaces.length}/{MAX_EXTRA_PLACES}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <Checkbox
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.target.checked)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400"
            >
              {isEn ? "🌱 I am vegetarian (Requires vegetarian dish)" : "🌱 Tôi là người ăn chay (Cần chuẩn bị món chay)"}
            </Checkbox>

            <Button
              type="primary"
              loading={isSubmitting}
              onClick={handleJoinPlan}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-black px-6 py-3 h-auto text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <i className="fa-solid fa-floppy-disk text-sm" />
              <span>{isEn ? "Save & RSVP (No Login Required)" : "Lưu & Xác Nhận Tham Gia (Không cần login)"}</span>
            </Button>
          </div>

          {/* Joined Success Feedback Banner */}
          {hasJoined && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2 font-bold">
                <i className="fa-solid fa-circle-check text-emerald-500 text-base" />
                <span>
                  {isEn
                    ? "🎉 You have successfully confirmed and saved the plan! No account login required."
                    : "🎉 Bạn đã tham gia và lưu kế hoạch thành công! Bạn không cần phải đăng nhập tài khoản."}
                </span>
              </div>
              <Button
                size="small"
                onClick={handleSavePlanLocally}
                className="bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700 rounded-xl"
              >
                <i className="fa-solid fa-bookmark mr-1" />
                {isPlanSavedLocally ? (isEn ? "Saved to Device" : "Đã lưu vào máy") : (isEn ? "Save Plan" : "Lưu lại kế hoạch")}
              </Button>
            </div>
          )}

          {/* Delivery status of the guest's response */}
          {submitted && (
            <div
              className={`rounded-2xl border-2 border-dashed p-4 space-y-3 ${
                submitted.delivered
                  ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/70 dark:bg-emerald-950/20"
                  : "border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    submitted.delivered ? "bg-emerald-500 text-white" : "bg-[#FFCB37] text-black"
                  }`}
                >
                  <i className={`fa-solid ${submitted.delivered ? "fa-check" : "fa-paper-plane"} text-sm`} />
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-black dark:text-white">
                    {submitted.delivered
                      ? isEn ? "Sent to the plan host" : "Đã gửi lựa chọn cho người tạo kế hoạch"
                      : isEn ? "One more step: send your options to the host" : "Còn 1 bước: gửi lựa chọn của bạn cho người tạo"}
                  </h3>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                    {submitted.delivered
                      ? isEn
                        ? "The AI will merge everyone's schedule for the host. You can change your choices above and save again to update."
                        : "AI sẽ tổng hợp lịch của cả nhóm cho người tạo. Bạn có thể đổi lựa chọn ở trên rồi lưu lại để cập nhật."
                      : isEn
                        ? "We could not reach the server automatically. Retry, or copy the link / message below and send it to the host via Zalo / Messenger."
                        : "Chưa gửi tự động được tới máy chủ. Bạn thử gửi lại, hoặc sao chép link / tin nhắn dưới đây gửi cho người tạo qua Zalo / Messenger."}
                  </p>
                </div>
              </div>

              <ul className="space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                {submitted.response.slots.map((s, i) => (
                  <li key={`s${i}`} className="flex flex-wrap items-center gap-x-2">
                    <i className="fa-solid fa-clock text-amber-500 text-[11px]" />
                    <span>{formatDateDisplay(s.date)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{s.start} - {s.end}</span>
                  </li>
                ))}
                {submitted.response.places.map((p, i) => (
                  <li key={`p${i}`} className="flex flex-wrap items-center gap-x-2">
                    <i className="fa-solid fa-location-dot text-red-500 text-[11px]" />
                    <span>{p.name}</span>
                    {p.is_new && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full">
                        {isEn ? "your suggestion" : "bạn đề xuất"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {!submitted.delivered && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  loading={isSubmitting}
                  onClick={handleRetrySend}
                  className="border-emerald-500 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-xl h-auto py-2 px-4 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-rotate-right" />
                  <span>{isEn ? "Retry sending" : "Gửi lại tự động"}</span>
                </Button>
                <Button
                  type="primary"
                  onClick={() =>
                    handleCopy(submitted.url, isEn ? "Response link copied!" : "Đã sao chép link phản hồi!")
                  }
                  className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black text-xs rounded-xl h-auto py-2 px-4 flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-link" />
                  <span>{isEn ? "Copy response link" : "Sao chép link phản hồi"}</span>
                </Button>
                <Button
                  onClick={() =>
                    handleCopy(
                      buildHostMessage(submitted.response, submitted.url),
                      isEn ? "Message copied - paste it into your chat!" : "Đã sao chép tin nhắn - dán vào Zalo / Messenger!"
                    )
                  }
                  className="border-amber-400 font-bold text-xs rounded-xl h-auto py-2 px-4 flex items-center gap-1.5"
                >
                  <i className="fa-regular fa-message text-amber-500" />
                  <span>{isEn ? "Copy message" : "Sao chép tin nhắn"}</span>
                </Button>
                {typeof navigator !== "undefined" && (navigator as any).share && (
                  <Button
                    onClick={() =>
                      (navigator as any)
                        .share({
                          title: planData?.summary || "Trove",
                          text: buildHostMessage(submitted.response, submitted.url),
                        })
                        .catch(() => {})
                    }
                    className="font-bold text-xs rounded-xl h-auto py-2 px-4 flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-share-nodes text-amber-500" />
                    <span>{isEn ? "Share..." : "Chia sẻ..."}</span>
                  </Button>
                )}
              </div>
              )}
            </div>
          )}

          {/* Attendees List Display */}
          {attendeesList.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
              <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                {isEn ? "Confirmed Attendees:" : "Danh sách thành viên tham gia:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {attendeesList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs font-bold shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-[10px]">
                      {attendee.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-black dark:text-white">{attendee.name}</span>
                    {attendee.isVegetarian && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                        {isEn ? "Vegetarian" : "Ăn chay"}
                      </span>
                    )}
                    {attendee.note && (
                      <span className="text-[10px] text-gray-400 font-normal italic">
                        ({attendee.note})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: LỊCH TRÌNH CHI TIẾT */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black dark:text-white flex items-center gap-2 font-display">
              <i className="fa-solid fa-route text-amber-500" />
              {isEn ? "Detailed Itinerary & Venue Analysis" : "Lịch Trình Chi Tiết Các Điểm Đến"}
            </h2>
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <i className="fa-regular fa-calendar-plus" />
              {isEn ? "Add to Google Calendar" : "Thêm vào Google Calendar"}
            </a>
          </div>

          <div className="space-y-6">
            {planData.schedule.map((stop, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all space-y-4"
              >
                {/* Header of stop */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#FF9F1C] font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-500 block">
                        {stop.activity_type}
                      </span>
                      <h3 className="text-xl font-black text-black dark:text-white">
                        {stop.place_name}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                        <i className="fa-solid fa-location-dot text-red-500 text-[11px]" />
                        {stop.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl text-black dark:text-white">
                      <i className="fa-solid fa-clock text-amber-500 text-[11px]" />
                      {stop.time}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">
                      {stop.estimated_cost}
                    </span>
                  </div>
                </div>

                {/* CRITICAL: VEGETARIAN STATUS BADGE */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      stop.vegetarian_friendly
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <i className={`fa-solid ${stop.vegetarian_friendly ? "fa-leaf text-emerald-500" : "fa-ban text-gray-400"}`} />
                    <span>
                      {stop.vegetarian_status || (stop.vegetarian_friendly ? (isEn ? "Vegetarian options available" : "Có phục vụ món chay") : (isEn ? "No vegetarian menu" : "Không có menu chay riêng"))}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.place_name} ${stop.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <i className="fa-solid fa-diamond-turn-right text-blue-500" />
                    {isEn ? "Google Maps" : "Chỉ đường Maps"}
                  </a>
                </div>

                {/* Why Suitable */}
                {stop.why_suitable && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    <span className="font-bold text-amber-700 dark:text-amber-400 mr-1">
                      {isEn ? "🎯 Why suitable:" : "🎯 Điểm phù hợp:"}
                    </span>
                    {stop.why_suitable}
                  </div>
                )}

                {/* PROS & CONS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Ưu điểm */}
                  {stop.pros && stop.pros.length > 0 && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                        <i className="fa-solid fa-circle-check text-emerald-500" />
                        {isEn ? "Real Review Highlights:" : "Ưu điểm thực tế:"}
                      </span>
                      <ul className="space-y-1.5">
                        {stop.pros.map((pro, pIdx) => (
                          <li key={pIdx} className="text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nhược điểm / Lưu ý */}
                  {stop.cons && stop.cons.length > 0 && (
                    <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase">
                        <i className="fa-solid fa-triangle-exclamation text-rose-500" />
                        {isEn ? "Drawbacks & Notes:" : "Lưu ý cần biết:"}
                      </span>
                      <ul className="space-y-1.5">
                        {stop.cons.map((con, cIdx) => (
                          <li key={cIdx} className="text-xs text-rose-900 dark:text-rose-200 font-medium flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Advice */}
        {planData.general_advice && (
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex items-start gap-3">
            <i className="fa-solid fa-lightbulb text-blue-500 text-lg mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                {isEn ? "Advice for the group:" : "Lời khuyên cho cả nhóm:"}
              </span>
              <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
                {planData.general_advice}
              </p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-6 pb-12 space-y-4">
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-3xl p-6 max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm font-black text-black dark:text-white">
              <i className="fa-solid fa-users text-[#FF9F1C]" />
              <span>{isEn ? "Trove Group Meeting Plan" : "Kế Hoạch Gặp Mặt Nhóm Trove"}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {isEn
                ? "You can save this plan to your device or add directly to your personal calendar. No registration or account login required!"
                : "Bạn có thể lưu kế hoạch này vào thiết bị hoặc thêm trực tiếp vào lịch cá nhân để không quên giờ hẹn. Hoàn toàn không cần đăng ký hay đăng nhập tài khoản!"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                onClick={handleSavePlanLocally}
                className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black px-5 py-2.5 h-auto text-xs rounded-xl border-none shadow-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-bookmark" />
                <span>
                  {isPlanSavedLocally
                    ? (isEn ? "Saved to Device" : "Đã lưu kế hoạch vào máy")
                    : (isEn ? "Save to Device (No Login)" : "Lưu kế hoạch vào máy (Không cần login)")}
                </span>
              </Button>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs"
              >
                <i className="fa-solid fa-calendar-plus" />
                <span>{isEn ? "Add to Google Calendar" : "Thêm vào Google Calendar"}</span>
              </a>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  message.success(isEn ? "Invite link copied to clipboard!" : "Đã sao chép link kế hoạch!");
                }}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-4 py-2.5 h-auto text-xs rounded-xl"
              >
                <i className="fa-solid fa-share-nodes mr-1 text-amber-500" />
                <span>{isEn ? "Share Link" : "Chia sẻ link"}</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
