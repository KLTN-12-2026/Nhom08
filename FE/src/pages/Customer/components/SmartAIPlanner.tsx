import React, { useState, useEffect } from "react";
import {
  Button,
  Slider,
  DatePicker,
  message,
  Spin,
  Tooltip,
  Modal,
  Input,
} from "antd";
import dayjs from "dayjs";
import RepositoryManager from "../../../data/repositoryManager";
import useLanguageStore from "../../../stores/languageStore.ts";
import { HostOptions, TimeSlot } from "../planCoordination.ts";

interface SmartAIPlannerProps {
  onBack: () => void;
  onPlanSaved: () => void;
}

interface PlanStop {
  time: string;
  activity_type: string;
  place_id?: number;
  place_name: string;
  address: string;
  estimated_cost: string;
  vegetarian_friendly: boolean;
  vegetarian_status: string;
  why_suitable: string;
  pros: string[];
  cons: string[];
  image?: string;
}

interface AIPlanResult {
  summary: string;
  meeting_vibe: string;
  schedule: PlanStop[];
  general_advice: string;
}

export default function SmartAIPlanner({
  onBack,
  onPlanSaved,
}: SmartAIPlannerProps) {
  const { t, currentLanguage } = useLanguageStore();

  const MEETING_TYPES = [
    {
      id: "class_reunion",
      label: t("aiPlanner.typeClassReunion"),
      icon: "fa-graduation-cap",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "business",
      label: t("aiPlanner.typeBusiness"),
      icon: "fa-briefcase",
      color: "from-amber-600 to-amber-700",
    },
    {
      id: "friends",
      label: t("aiPlanner.typeFriends"),
      icon: "fa-user-group",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "dating",
      label: t("aiPlanner.typeDating"),
      icon: "fa-heart",
      color: "from-rose-500 to-pink-600",
    },
    {
      id: "family",
      label: t("aiPlanner.typeFamily"),
      icon: "fa-people-roof",
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "birthday",
      label: t("aiPlanner.typeBirthday"),
      icon: "fa-cake-candles",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const TIME_SLOTS = [
    {
      id: "morning",
      label: t("aiPlanner.slotMorning"),
      time: "08:30 - 11:30",
      start: "08:30",
      end: "11:30",
      icon: "fa-sun",
    },
    {
      id: "noon",
      label: t("aiPlanner.slotNoon"),
      time: "11:30 - 14:00",
      start: "11:30",
      end: "14:00",
      icon: "fa-utensils",
    },
    {
      id: "afternoon",
      label: t("aiPlanner.slotAfternoon"),
      time: "14:30 - 18:00",
      start: "14:30",
      end: "18:00",
      icon: "fa-cloud-sun",
    },
    {
      id: "evening",
      label: t("aiPlanner.slotEvening"),
      time: "18:30 - 22:00",
      start: "18:30",
      end: "22:00",
      icon: "fa-moon",
    },
  ];

  // Input States
  const [meetingType, setMeetingType] = useState<string>("friends");
  const [customType, setCustomType] = useState<string>("");
  const [participants, setParticipants] = useState<number>(4);
  const [groupNote, setGroupNote] = useState<string>("");

  // Special Preferences
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [noAlcohol, setNoAlcohol] = useState<boolean>(false);
  const [needsParking, setNeedsParking] = useState<boolean>(true);
  const [needsKaraoke, setNeedsKaraoke] = useState<boolean>(false);
  const [wantsSpecialties, setWantsSpecialties] = useState<boolean>(false);
  const [needsPrivateRoom, setNeedsPrivateRoom] = useState<boolean>(false);
  const [wantsNiceView, setWantsNiceView] = useState<boolean>(false);

  // Time & Budget
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(
    dayjs().add(1, "day"),
  );
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([
    "evening",
  ]);
  const [customTime, setCustomTime] = useState<string>("");
  const [budgetPerPerson, setBudgetPerPerson] = useState<number>(250000);
  const [userNote, setUserNote] = useState<string>("");

  // System Places & Reviews Context
  const [placesData, setPlacesData] = useState<any[]>([]);
  const [activityGroups, setActivityGroups] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);

  // Public Share Export State
  const [exportedShareUrl, setExportedShareUrl] = useState<string>("");
  // Stable id of the shared plan: all guest responses are grouped by this id
  const [exportedPlanId, setExportedPlanId] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSaveSuccessModalOpen, setIsSaveSuccessModalOpen] =
    useState<boolean>(false);

  // AI Loading & Result States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [aiResult, setAiResult] = useState<AIPlanResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch available places and activity groups on mount
  useEffect(() => {
    const fetchPlacesAndGroups = async () => {
      setLoadingPlaces(true);
      try {
        const [resPlaces, resGroups] = await Promise.allSettled([
          RepositoryManager.places.getPublicPlaces({ per_page: 80 }),
          RepositoryManager.activityGroups.getGroups(),
        ]);

        if (resPlaces.status === "fulfilled") {
          const list =
            resPlaces.value?.data?.data || resPlaces.value?.data || [];
          setPlacesData(Array.isArray(list) ? list : []);
        }

        if (resGroups.status === "fulfilled") {
          const rawGroups =
            resGroups.value?.data?.data || resGroups.value?.data || [];
          setActivityGroups(Array.isArray(rawGroups) ? rawGroups : []);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoadingPlaces(false);
      }
    };
    fetchPlacesAndGroups();
  }, []);

  const handleGenerateAI = async () => {
    const isEn = currentLanguage === "en";
    setIsGenerating(true);
    setLoadingStep(t("aiPlanner.step1"));

    try {
      // 1. Build context of places with their real reviews and attributes
      const filteredPlaces = placesData.slice(0, 50).map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        categories: (p.categories || [])
          .map((c: any) => c.name || c)
          .join(", "),
        average_price: p.average_price,
        description: p.description,
        rating: p.rating || p.average_rating || 4.5,
        reviews: (p.reviews || []).slice(0, 4).map((r: any) => ({
          rating: r.rating,
          comment: r.comment,
        })),
      }));

      setLoadingStep(t("aiPlanner.step2"));

      // 2. Prepare user prompt
      const meetingLabel =
        MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
        customType ||
        (isEn ? "General Meetup" : "Gặp mặt chung");
      const chosenSlots = TIME_SLOTS.filter((t) =>
        selectedTimeSlots.includes(t.id),
      );
      const chosenTime =
        customTime.trim() ||
        (chosenSlots.length > 0
          ? chosenSlots.map((s) => `${s.label} (${s.time})`).join(", ")
          : "18:30 - 22:00");

      const promptData = {
        meeting_type: meetingLabel,
        participants_count: participants,
        group_note: groupNote,
        preferences: {
          vegetarian: isVegetarian
            ? isEn
              ? "MANDATORY: Vegetarian participant (requires verified vegetarian menu or vegan restaurant)"
              : "BẮT BUỘC: Có người ăn chay (cần thực đơn chay thật sự hoặc quán thuần chay)"
            : isEn
              ? "Not required"
              : "Không bắt buộc",
          no_alcohol: noAlcohol
            ? isEn
              ? "No alcohol / mocktails and healthy drinks preferred"
              : "Kiêng cồn / không dùng bia rượu"
            : isEn
              ? "Normal"
              : "Bình thường",
          parking: needsParking
            ? isEn
              ? "MANDATORY: Convenient and safe car/motorbike parking"
              : "BẮT BUỘC: Cần chỗ đỗ xe ô tô / xe máy thuận tiện, an toàn"
            : isEn
              ? "Standard"
              : "Không yêu cầu cao",
          karaoke: needsKaraoke
            ? isEn
              ? "Karaoke / entertainment after dining"
              : "Có hoạt động hát Karaoke giải trí sau bữa ăn"
            : isEn
              ? "No"
              : "Không cần",
          specialties: wantsSpecialties
            ? isEn
              ? "Local specialty cuisine"
              : "Ưu tiên ẩm thực đặc sản vùng miền nổi bật"
            : isEn
              ? "Standard"
              : "Bình thường",
          private_room: needsPrivateRoom
            ? isEn
              ? "Private room for business/quiet conversation"
              : "Ưu tiên quán có phòng riêng (VIP / yên tĩnh để tiếp khách, họp bàn)"
            : isEn
              ? "Standard"
              : "Bình thường",
          nice_view: wantsNiceView
            ? isEn
              ? "Scenic view, airy space"
              : "Không gian view đẹp, check-in thoáng đãng"
            : isEn
              ? "Standard"
              : "Bình thường",
        },
        schedule: {
          date: selectedDate
            ? selectedDate.format("DD/MM/YYYY")
            : isEn
              ? "Today"
              : "Hôm nay",
          time_frame: chosenTime,
        },
        budget_per_person: isEn
          ? `${budgetPerPerson.toLocaleString()} VND`
          : `${budgetPerPerson.toLocaleString("vi-VN")} VNĐ`,
        additional_notes: userNote,
        places_database: filteredPlaces,
      };

      const systemInstruction = `You are the TROVE Smart Meeting & Activity Planner AI.
CRITICAL LANGUAGE REQUIREMENT:
${isEn ? "You MUST output all textual descriptions, notes, vibe, reasons, pros, cons, and general advice completely in ENGLISH." : "Bạn PHẢI trả về toàn bộ văn bản (summary, meeting_vibe, why_suitable, pros, cons, vegetarian_status, general_advice) hoàn toàn bằng TIẾNG VIỆT."}

CORE TASKS:
1. INSPECT REAL REVIEWS & PLACES:
   - Do not hallucinate or make up reviews. Check real customer reviews to verify:
     + Does the venue have real vegetarian options or vegan dishes?
     + How convenient is parking for cars and motorbikes?
     + Does the ambience match the meeting type (${meetingLabel})?
2. MATCH SCHEDULE & TIMELINE:
   - Create a realistic schedule within the free time frame (${chosenTime}). Usually 1 to 2 balanced stops (e.g. Stop 1: Dining -> Stop 2: Dessert/Cafe/Karaoke nearby).
3. EXPLICIT VEGETARIAN STATUS:
   - For every stop, you MUST determine:
     + "vegetarian_friendly": true or false (boolean).
     + "vegetarian_status": Clear concise description (e.g. ${isEn ? '"Dedicated vegetarian menu available", "Vegetarian dishes upon request", "No dedicated vegetarian options", or "100% Vegan restaurant"' : '"Có phục vụ menu món chay đa dạng", "Có một số món chay/rau củ theo yêu cầu", "Không có menu chay riêng, chỉ có đồ mặn", hoặc "Quán thuần chay 100%"'}).
4. PROS & CONS ANALYSIS:
   - "pros": 2-3 genuine highlights extracted from actual customer reviews, parking, vegetarian options, ambience.
   - "cons": 1-2 honest drawbacks or warnings (e.g. requires advance reservation on weekends, narrow alley, pricey drinks...).

MANDATORY JSON FORMAT ONLY:
{
  "summary": "${isEn ? "Short summary of the itinerary" : "Tóm tắt ngắn gọn lịch trình"}",
  "meeting_vibe": "${isEn ? "Vibe (e.g. Cozy, energetic, formal...)" : "Không khí chủ đạo (ví dụ: Ấm cúng, sôi nổi, trang trọng...)"}",
  "schedule": [
    {
      "time": "18:30 - 20:30",
      "activity_type": "${isEn ? "Dining / Meetup" : "Ăn uống / Gặp mặt"}",
      "place_id": 123,
      "place_name": "Name from database or suitable suggestion",
      "address": "Specific address",
      "estimated_cost": "~250,000 VND / person",
      "vegetarian_friendly": true,
      "vegetarian_status": "${isEn ? "Vegetarian options available" : "Có phục vụ món chay"}",
      "why_suitable": "${isEn ? "Why this fits the group's requirements" : "Lý do vì sao quán này đáp ứng chuẩn xác tiêu chí của nhóm"}",
      "pros": [
        "${isEn ? "Authentic highlight 1" : "Ưu điểm 1 từ thực tế"}",
        "${isEn ? "Authentic highlight 2" : "Ưu điểm 2 từ thực tế"}"
      ],
      "cons": [
        "${isEn ? "Practical note / drawback" : "Nhược điểm hoặc lưu ý thực tế cần biết"}"
      ]
    }
  ],
  "general_advice": "${isEn ? "Preparation advice for host (reservations, timing...)" : "Lời khuyên chuẩn bị cho người chủ trì"}"
}`;

      const apiKey = "AQ.Ab8RN6JS4i_WBehe3-uMoRvWJL0-h2DCXnlSj1iOMcTUiFd6Hg";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      setLoadingStep(t("aiPlanner.step3"));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Group planning request and places database: \n${JSON.stringify(promptData)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(
          isEn
            ? "Did not receive response from AI"
            : "Không nhận được phản hồi từ AI",
        );
      }

      // Parse JSON from AI response
      const cleanJson = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedResult: AIPlanResult = JSON.parse(cleanJson);
      setAiResult(parsedResult);
      message.success(
        isEn
          ? "AI has analyzed and generated your complete itinerary!"
          : "AI đã phân tích và thiết lập lịch trình hoàn chỉnh!",
      );
    } catch (err: any) {
      console.error("AI Generation error:", err);
      message.error(
        err.message ||
          (isEn
            ? "Failed to generate plan with AI. Please try again!"
            : "Đã xảy ra lỗi khi tạo kế hoạch bằng AI. Vui lòng thử lại!"),
      );
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  const handleSaveAIPlan = async () => {
    if (!aiResult) return;
    setIsSaving(true);
    try {
      // Find matching place IDs from database or use available place IDs
      const validDatabasePlaceIds = new Set(
        placesData.map((p) => Number(p.id)),
      );
      let matchedPlaceIds = aiResult.schedule
        .map((s) => s.place_id)
        .filter(
          (id): id is number =>
            typeof id === "number" && id > 0 && validDatabasePlaceIds.has(id),
        );

      // If no direct place_id matched, fallback to matching by place_name
      if (matchedPlaceIds.length === 0) {
        aiResult.schedule.forEach((s) => {
          const found = placesData.find(
            (p) =>
              p.name.toLowerCase().includes(s.place_name.toLowerCase()) ||
              s.place_name.toLowerCase().includes(p.name.toLowerCase()),
          );
          if (found && !matchedPlaceIds.includes(Number(found.id))) {
            matchedPlaceIds.push(Number(found.id));
          }
        });
      }

      // If still empty, grab first place from database as reference
      if (matchedPlaceIds.length === 0 && placesData.length > 0) {
        matchedPlaceIds.push(Number(placesData[0].id));
      }

      const totalBudget = budgetPerPerson * participants;
      const validGroupIds = activityGroups.map((g) => Number(g.id));
      const chosenActivityGroups =
        validGroupIds.length > 0 ? [validGroupIds[0]] : [1];

      const payload = {
        budget: totalBudget || 400000,
        activity_groups: chosenActivityGroups,
        place_ids: matchedPlaceIds,
        total_estimated: totalBudget || 400000,
        filters: {
          date: selectedDate
            ? selectedDate.format("YYYY-MM-DD HH:mm")
            : dayjs().format("YYYY-MM-DD HH:mm"),
          summary: aiResult.summary,
          meeting_vibe: aiResult.meeting_vibe,
          meeting_type:
            MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
            customType ||
            (currentLanguage === "en" ? "Meeting" : "Gặp mặt"),
        },
      };

      const res = await RepositoryManager.plans.saveNewPlan(payload);
      if (res && res.success) {
        // Build host options with all time slots selected by the host
        const dateIso = selectedDate
          ? selectedDate.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD");
        const chosenSlots = TIME_SLOTS.filter((t) =>
          selectedTimeSlots.includes(t.id),
        );
        const hostSlots: TimeSlot[] =
          chosenSlots.length > 0
            ? chosenSlots.map((s) => ({
                date: dateIso,
                start: s.start,
                end: s.end,
              }))
            : [{ date: dateIso, start: "18:30", end: "22:00" }];
        const hostPlaces = aiResult.schedule
          .filter((s) => !!s.place_name)
          .map((s) => ({
            name: s.place_name,
            address: s.address,
            place_id: s.place_id,
          }));

        const hostOptions: HostOptions = {
          slots: hostSlots,
          places: hostPlaces,
        };

        // Also persist this plan locally so shared links work reliably
        const newPlanId =
          exportedPlanId || res.data?.id?.toString() || Date.now().toString();
        setExportedPlanId(newPlanId);
        const sharedData = {
          id: newPlanId,
          summary: aiResult.summary,
          meeting_vibe: aiResult.meeting_vibe,
          meeting_type:
            MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
            customType ||
            (currentLanguage === "en" ? "Meeting" : "Gặp mặt"),
          participants,
          date: selectedDate
            ? selectedDate.format("DD/MM/YYYY")
            : dayjs().format("DD/MM/YYYY"),
          schedule: aiResult.schedule,
          general_advice: aiResult.general_advice,
          host_options: hostOptions,
        };
        localStorage.setItem(
          `trove_plan_${newPlanId}`,
          JSON.stringify(sharedData),
        );
        localStorage.setItem(
          "trove_shared_plan_latest",
          JSON.stringify(sharedData),
        );

        const jsonStr = JSON.stringify(sharedData);
        const encoded = encodeURIComponent(
          btoa(unescape(encodeURIComponent(jsonStr))),
        );
        const url = `${window.location.origin}/plans/shared?data=${encoded}`;

        setExportedShareUrl(url);
        setIsSaveSuccessModalOpen(true);
        message.success(
          currentLanguage === "en"
            ? "Plan saved to your account successfully!"
            : "Đã lưu kế hoạch vào danh sách của bạn thành công!",
        );
      } else {
        message.error(
          res?.message ||
            (currentLanguage === "en"
              ? "Error saving plan!"
              : "Lỗi khi lưu kế hoạch!"),
        );
      }
    } catch (e: any) {
      console.error("Save plan error:", e);
      const serverMsg =
        e?.response?.data?.message ||
        e?.message ||
        (currentLanguage === "en"
          ? "An error occurred while saving the plan!"
          : "Đã xảy ra lỗi khi lưu kế hoạch!");
      message.error(serverMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSharedLink = () => {
    if (!aiResult) return;
    const isEn = currentLanguage === "en";
    const planId = exportedPlanId || "ai_" + Date.now();
    setExportedPlanId(planId);
    const dateIso = selectedDate
      ? selectedDate.format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const chosenSlots = TIME_SLOTS.filter((t) =>
      selectedTimeSlots.includes(t.id),
    );
    const hostSlots: TimeSlot[] =
      chosenSlots.length > 0
        ? chosenSlots.map((s) => ({
            date: dateIso,
            start: s.start,
            end: s.end,
          }))
        : [{ date: dateIso, start: "18:30", end: "22:00" }];
    const hostPlaces = aiResult.schedule
      .filter((s) => !!s.place_name)
      .map((s) => ({
        name: s.place_name,
        address: s.address,
        place_id: s.place_id,
      }));

    const hostOptions: HostOptions = {
      slots: hostSlots,
      places: hostPlaces,
    };

    const sharedData = {
      id: planId,
      summary: aiResult.summary,
      meeting_vibe: aiResult.meeting_vibe,
      meeting_type:
        MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
        customType ||
        (isEn ? "Meeting" : "Gặp mặt"),
      participants,
      date: selectedDate
        ? selectedDate.format("DD/MM/YYYY")
        : dayjs().format("DD/MM/YYYY"),
      schedule: aiResult.schedule,
      general_advice: aiResult.general_advice,
      host_options: hostOptions,
    };

    // Save locally
    localStorage.setItem(`trove_plan_${planId}`, JSON.stringify(sharedData));
    localStorage.setItem(
      "trove_shared_plan_latest",
      JSON.stringify(sharedData),
    );

    // Encode into URL for non-login sharing
    const jsonStr = JSON.stringify(sharedData);
    const encoded = encodeURIComponent(
      btoa(unescape(encodeURIComponent(jsonStr))),
    );
    const url = `${window.location.origin}/plans/shared?data=${encoded}`;

    setExportedShareUrl(url);
    navigator.clipboard.writeText(url);
    message.success(
      isEn
        ? "🎉 Group invite link generated and copied to clipboard!"
        : "🎉 Đã xuất link mời tham gia chung và tự động sao chép!",
    );
    setIsShareModalOpen(true);
  };

  const copyShareText = () => {
    if (!aiResult) return;
    const isEn = currentLanguage === "en";
    const meetingLabel =
      MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
      (isEn ? "Group Meetup" : "Gặp mặt nhóm");
    const dateStr = selectedDate ? selectedDate.format("DD/MM/YYYY") : "";

    let text = isEn
      ? `📢 MEETING PLAN: ${meetingLabel.toUpperCase()}\n🗓️ Date: ${dateStr}\n👥 Attendees: ${participants} people\n✨ Vibe: ${aiResult.meeting_vibe}\n\n📍 DETAILED ITINERARY:\n`
      : `📢 KẾ HOẠCH GẶP MẶT: ${meetingLabel.toUpperCase()}\n🗓️ Ngày: ${dateStr}\n👥 Số lượng: ${participants} người\n✨ Tinh thần: ${aiResult.meeting_vibe}\n\n📍 LỊCH TRÌNH CHI TIẾT:\n`;

    aiResult.schedule.forEach((stop, idx) => {
      text += `\n${idx + 1}. [${stop.time}] ${stop.place_name} (${stop.activity_type})\n`;
      text += isEn
        ? `   - Address: ${stop.address}\n`
        : `   - Địa chỉ: ${stop.address}\n`;
      text += isEn
        ? `   - Cost: ~${stop.estimated_cost}\n`
        : `   - Chi phí: ~${stop.estimated_cost}\n`;
      if (stop.vegetarian_status || stop.vegetarian_friendly) {
        text += isEn
          ? `   - Vegetarian: ${stop.vegetarian_status || (stop.vegetarian_friendly ? "Vegetarian options available" : "No vegetarian options")}\n`
          : `   - Ăn chay: ${stop.vegetarian_status || (stop.vegetarian_friendly ? "Có phục vụ món chay" : "Không có menu chay riêng")}\n`;
      }
      if (stop.pros && stop.pros.length > 0) {
        text += isEn
          ? `   - Highlight: ${stop.pros[0]}\n`
          : `   - Điểm nổi bật: ${stop.pros[0]}\n`;
      }
      if (stop.cons && stop.cons.length > 0) {
        text += isEn
          ? `   - Note: ${stop.cons[0]}\n`
          : `   - Lưu ý: ${stop.cons[0]}\n`;
      }
    });

    if (aiResult.general_advice) {
      text += isEn
        ? `\n💡 HOST ADVICE: ${aiResult.general_advice}\n`
        : `\n💡 LƯU Ý CHUNG: ${aiResult.general_advice}\n`;
    }

    let shareUrl = exportedShareUrl;
    if (!shareUrl) {
      const planId = exportedPlanId || "ai_" + Date.now();
      setExportedPlanId(planId);

      const dateIso = selectedDate
        ? selectedDate.format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      const chosenSlots = TIME_SLOTS.filter((t) =>
        selectedTimeSlots.includes(t.id),
      );
      const hostSlots: TimeSlot[] =
        chosenSlots.length > 0
          ? chosenSlots.map((s) => ({
              date: dateIso,
              start: s.start,
              end: s.end,
            }))
          : [{ date: dateIso, start: "18:30", end: "22:00" }];
      const hostPlaces = aiResult.schedule
        .filter((s) => !!s.place_name)
        .map((s) => ({
          name: s.place_name,
          address: s.address,
          place_id: s.place_id,
        }));

      const hostOptions: HostOptions = {
        slots: hostSlots,
        places: hostPlaces,
      };

      const sharedData = {
        id: planId,
        summary: aiResult.summary,
        meeting_vibe: aiResult.meeting_vibe,
        meeting_type:
          MEETING_TYPES.find((m) => m.id === meetingType)?.label ||
          customType ||
          (isEn ? "Meeting" : "Gặp mặt"),
        participants,
        date: selectedDate
          ? selectedDate.format("DD/MM/YYYY")
          : dayjs().format("DD/MM/YYYY"),
        schedule: aiResult.schedule,
        general_advice: aiResult.general_advice,
        host_options: hostOptions,
      };
      localStorage.setItem(`trove_plan_${planId}`, JSON.stringify(sharedData));
      localStorage.setItem(
        "trove_shared_plan_latest",
        JSON.stringify(sharedData),
      );
      const jsonStr = JSON.stringify(sharedData);
      const encoded = encodeURIComponent(
        btoa(unescape(encodeURIComponent(jsonStr))),
      );
      shareUrl = `${window.location.origin}/plans/shared?data=${encoded}`;
      setExportedShareUrl(shareUrl);
    }

    text += isEn
      ? `\n🔗 Link to view & RSVP (No login required):\n${shareUrl}\n\n👉 Created & shared with Trove AI Planner.`
      : `\n🔗 Link xem & đăng ký tham gia chung (Không cần đăng nhập):\n${shareUrl}\n\n👉 Lập và chia sẻ bởi Trove AI Planner.`;

    navigator.clipboard.writeText(text);
    message.success(
      isEn
        ? "Summary copied to clipboard for messaging apps!"
        : "Đã sao chép nội dung tóm tắt để gửi vào Zalo / Messenger cho cả nhóm!",
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 font-sans text-gray-900 dark:text-gray-100 pb-28">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          <span>{t("aiPlanner.back")}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-[#FF9F1C] text-black shadow-sm">
            <i className="fa-solid fa-wand-magic-sparkles animate-spin" />
            {t("aiPlanner.tag")}
          </span>
        </div>
      </div>

      {/* Main Container */}
      {!aiResult ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 p-8 text-black shadow-xl">
            <div className="relative z-10 space-y-2 max-w-xl">
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full">
                {t("aiPlanner.heroTag")}
              </span>
              <h2 className="text-3xl font-black tracking-tight font-display">
                {t("aiPlanner.heroTitle")}
              </h2>
              <p className="text-sm font-semibold opacity-90 leading-relaxed">
                {t("aiPlanner.heroDesc")}
              </p>
            </div>
            <i className="fa-solid fa-robot absolute -right-6 -bottom-6 text-9xl text-black/10 pointer-events-none" />
          </div>

          {/* SECTION 1: LOẠI HÌNH GẶP MẶT */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#FF9F1C] font-black flex items-center justify-center text-sm">
                1
              </span>
              <div>
                <h3 className="text-base font-black text-black dark:text-white">
                  {t("aiPlanner.sec1Title")}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {t("aiPlanner.sec1Desc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {MEETING_TYPES.map((type) => {
                const isSelected = meetingType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setMeetingType(type.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-amber-50 dark:bg-amber-950/20 border-[#FFCB37] shadow-md scale-[1.02]"
                        : "bg-gray-50/50 dark:bg-gray-850 border-gray-200/60 dark:border-gray-800 hover:border-amber-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm bg-gradient-to-br ${type.color} shadow-sm shrink-0`}
                    >
                      <i className={`fa-solid ${type.icon}`} />
                    </div>
                    <span className="text-xs font-bold text-black dark:text-white leading-tight">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: THÀNH PHẦN THAM GIA & SỞ THÍCH ĂN UỐNG */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#FF9F1C] font-black flex items-center justify-center text-sm">
                2
              </span>
              <div>
                <h3 className="text-base font-black text-black dark:text-white">
                  {t("aiPlanner.sec2Title")}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {t("aiPlanner.sec2Desc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Participant Stepper */}
              <div className="space-y-3 bg-gray-50/60 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    <i className="fa-solid fa-users mr-1.5 text-amber-500" />
                    {t("aiPlanner.participantsLabel")}
                  </span>
                  <span className="text-base font-black text-black dark:text-white bg-white dark:bg-gray-800 px-3 py-1 rounded-xl shadow-xs">
                    {participants} {t("aiPlanner.people")}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={30}
                  value={participants}
                  onChange={(val) => setParticipants(val)}
                  trackStyle={{ backgroundColor: "#FFCB37" }}
                  handleStyle={{ borderColor: "#FFCB37" }}
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-bold">
                  <span>1 {t("aiPlanner.people")}</span>
                  <span>10 {t("aiPlanner.people")}</span>
                  <span>20 {t("aiPlanner.people")}</span>
                  <span>30+ {t("aiPlanner.people")}</span>
                </div>
              </div>

              {/* Tên nhóm hoặc thành phần */}
              <div className="space-y-2 bg-gray-50/60 dark:bg-gray-850 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  <i className="fa-solid fa-id-badge mr-1.5 text-blue-500" />
                  {t("aiPlanner.whoAreParticipants")}
                </label>
                <input
                  type="text"
                  placeholder={t("aiPlanner.whoPlaceholder")}
                  value={groupNote}
                  onChange={(e) => setGroupNote(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Special Diet Checks */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-500 block mb-2 uppercase tracking-wider">
                {t("aiPlanner.dietaryTitle")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsVegetarian(!isVegetarian)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isVegetarian
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                      : "bg-gray-50/50 dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <i
                    className={`fa-solid fa-leaf text-base ${isVegetarian ? "text-emerald-500" : "text-gray-400"}`}
                  />
                  <div>
                    <span className="text-xs block font-bold">
                      {t("aiPlanner.vegLabel")}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {t("aiPlanner.vegSub")}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNoAlcohol(!noAlcohol)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    noAlcohol
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-400 text-blue-800 dark:text-blue-300 font-bold shadow-sm"
                      : "bg-gray-50/50 dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <i
                    className={`fa-solid fa-ban text-base ${noAlcohol ? "text-blue-500" : "text-gray-400"}`}
                  />
                  <div>
                    <span className="text-xs block font-bold">
                      {t("aiPlanner.noAlcoholLabel")}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {t("aiPlanner.noAlcoholSub")}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: TIỆN ÍCH & TRẢI NGHIỆM */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#FF9F1C] font-black flex items-center justify-center text-sm">
                3
              </span>
              <div>
                <h3 className="text-base font-black text-black dark:text-white">
                  {t("aiPlanner.sec3AmenitiesTitle")}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {t("aiPlanner.sec3AmenitiesDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  checked: needsParking,
                  setter: setNeedsParking,
                  icon: "fa-square-parking",
                  title: t("aiPlanner.amenityParking"),
                  sub: t("aiPlanner.amenityParkingSub"),
                  color: "text-amber-500",
                },
                {
                  checked: needsKaraoke,
                  setter: setNeedsKaraoke,
                  icon: "fa-microphone",
                  title: t("aiPlanner.amenityKaraoke"),
                  sub: t("aiPlanner.amenityKaraokeSub"),
                  color: "text-purple-500",
                },
                {
                  checked: wantsSpecialties,
                  setter: setWantsSpecialties,
                  icon: "fa-bowl-food",
                  title: t("aiPlanner.amenitySpecialties"),
                  sub: t("aiPlanner.amenitySpecialtiesSub"),
                  color: "text-red-500",
                },
                {
                  checked: needsPrivateRoom,
                  setter: setNeedsPrivateRoom,
                  icon: "fa-door-closed",
                  title: t("aiPlanner.amenityPrivateRoom"),
                  sub: t("aiPlanner.amenityPrivateRoomSub"),
                  color: "text-indigo-500",
                },
                {
                  checked: wantsNiceView,
                  setter: setWantsNiceView,
                  icon: "fa-camera",
                  title: t("aiPlanner.amenityNiceView"),
                  sub: t("aiPlanner.amenityNiceViewSub"),
                  color: "text-pink-500",
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.setter(!item.checked)}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    item.checked
                      ? "bg-amber-50/80 dark:bg-amber-950/20 border-[#FFCB37] shadow-xs"
                      : "bg-gray-50/50 dark:bg-gray-850 border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <i
                    className={`fa-solid ${item.icon} text-base mt-0.5 ${item.checked ? item.color : "text-gray-400"}`}
                  />
                  <div>
                    <span className="text-xs font-bold block text-black dark:text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.sub}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: LỊCH RẢNH CỦA NHỮNG NGƯỜI THAM GIA */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#FF9F1C] font-black flex items-center justify-center text-sm">
                4
              </span>
              <div>
                <h3 className="text-base font-black text-black dark:text-white">
                  {t("aiPlanner.sec4ScheduleTitle")}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {t("aiPlanner.sec4ScheduleDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Ngày */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  <i className="fa-solid fa-calendar mr-1.5 text-amber-500" />
                  {t("aiPlanner.expectedDate")}
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  format="DD/MM/YYYY"
                  className="w-full py-2.5 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {/* Ngân sách ước tính */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600 dark:text-gray-400">
                  <span>
                    <i className="fa-solid fa-wallet mr-1.5 text-emerald-500" />
                    {t("aiPlanner.budgetPerPerson")}
                  </span>
                  <span className="text-amber-500 font-black">
                    {budgetPerPerson.toLocaleString()}{" "}
                    {currentLanguage === "en" ? "VND" : "đ"}
                  </span>
                </div>
                <Slider
                  min={100000}
                  max={1500000}
                  step={50000}
                  value={budgetPerPerson}
                  onChange={(val) => setBudgetPerPerson(val)}
                  trackStyle={{ backgroundColor: "#FFCB37" }}
                  handleStyle={{ borderColor: "#FFCB37" }}
                />
              </div>
            </div>

            {/* Khung giờ rảnh */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">
                  {t("aiPlanner.freeTimeSlot")}
                </span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                  {currentLanguage === "en"
                    ? "Select one or more"
                    : "Chọn 1 hoặc nhiều khung"}{" "}
                  ({selectedTimeSlots.length}/{TIME_SLOTS.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSlotActive = selectedTimeSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlots((prev) => {
                          if (prev.includes(slot.id)) {
                            // Don't allow unchecking if it's the last one selected
                            return prev.length > 1
                              ? prev.filter((id) => id !== slot.id)
                              : prev;
                          } else {
                            return [...prev, slot.id];
                          }
                        });
                        setCustomTime("");
                      }}
                      className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSlotActive
                          ? "bg-amber-50 dark:bg-amber-950/30 border-[#FFCB37] shadow-sm text-black dark:text-white ring-1 ring-[#FFCB37]"
                          : "bg-gray-50/50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-amber-200"
                      }`}
                    >
                      {isSlotActive && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FFCB37] text-black text-[9px] font-black flex items-center justify-center">
                          <i className="fa-solid fa-check" />
                        </span>
                      )}
                      <i
                        className={`fa-solid ${slot.icon} block text-base mb-1 ${isSlotActive ? "text-amber-500" : "text-gray-400"}`}
                      />
                      <span className="text-xs font-bold block">
                        {slot.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                        {slot.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                <i className="fa-solid fa-comment-dots mr-1.5 text-purple-500" />
                {t("aiPlanner.additionalNoteLabel")}
              </label>
              <textarea
                rows={2}
                placeholder={t("aiPlanner.additionalNotePlaceholder")}
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <Button
              type="primary"
              onClick={handleGenerateAI}
              loading={isGenerating}
              className="w-full bg-gradient-to-r from-[#FFCB37] via-[#FF9F1C] to-amber-500 hover:opacity-95 text-black border-none font-black py-4 rounded-2xl h-auto text-base shadow-[0_8px_25px_rgba(255,159,28,0.3)] flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-lg" />
              <span>{t("aiPlanner.btnGenerate")}</span>
            </Button>
            {isGenerating && (
              <div className="mt-4 text-center space-y-2">
                <Spin />
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                  {loadingStep}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECTION: AI RESULT VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Result Header */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-850 dark:to-gray-900 border border-amber-200/60 dark:border-amber-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-black">
                  {t("aiPlanner.resultReady")}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <i className="fa-solid fa-users mr-1 text-amber-500" />
                  {participants} {t("aiPlanner.people")}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <i className="fa-solid fa-calendar mr-1 text-amber-500" />
                  {selectedDate ? selectedDate.format("DD/MM/YYYY") : ""}
                </span>
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white font-display">
                {aiResult.summary}
              </h2>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <i className="fa-solid fa-sparkles" />
                {t("aiPlanner.vibeLabel")}{" "}
                <span className="text-black dark:text-white font-black">
                  {aiResult.meeting_vibe}
                </span>
              </p>
            </div>
          </div>

          {/* Timeline Schedule Cards */}
          <div className="space-y-5">
            <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-route text-amber-500" />
              {t("aiPlanner.itineraryTitle")}
            </h3>

            {aiResult.schedule.map((stop, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-md hover:shadow-lg transition-all relative overflow-hidden space-y-4"
              >
                {/* Header of stop */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#FF9F1C] font-black flex items-center justify-center text-sm shadow-xs">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-500 block">
                        {stop.activity_type}
                      </span>
                      <h4 className="text-lg font-black text-black dark:text-white">
                        {stop.place_name}
                      </h4>
                      <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                        <i className="fa-solid fa-location-dot text-red-400 text-[11px]" />
                        {stop.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-xl text-black dark:text-white">
                      <i className="fa-solid fa-clock text-amber-500 text-[11px]" />
                      {stop.time}
                    </span>
                    <span className="block text-[11px] font-bold text-gray-400 mt-1">
                      {stop.estimated_cost}
                    </span>
                  </div>
                </div>

                {/* VEGETARIAN STATUS & MAPS BADGE */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      stop.vegetarian_friendly
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                    }`}
                  >
                    <i
                      className={`fa-solid ${stop.vegetarian_friendly ? "fa-leaf text-emerald-500" : "fa-utensils text-amber-500"}`}
                    />
                    <span>
                      <strong className="mr-1">
                        {t("aiPlanner.stopVegetarian")}
                      </strong>
                      {stop.vegetarian_status ||
                        (stop.vegetarian_friendly
                          ? t("aiPlanner.stopVegYes")
                          : t("aiPlanner.stopVegNo"))}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.place_name} ${stop.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <i className="fa-solid fa-diamond-turn-right text-blue-500" />
                    {t("aiPlanner.stopMaps")}
                  </a>
                </div>

                {/* Why Suitable */}
                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <span className="font-bold text-amber-700 dark:text-amber-400 mr-1">
                    {t("aiPlanner.stopReason")}
                  </span>
                  {stop.why_suitable}
                </div>

                {/* PROS & CONS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Ưu điểm */}
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                      <i className="fa-solid fa-circle-check text-emerald-500" />
                      {t("aiPlanner.stopPros")}
                    </span>
                    <ul className="space-y-1.5">
                      {stop.pros.map((pro, pIdx) => (
                        <li
                          key={pIdx}
                          className="text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-start gap-2"
                        >
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Nhược điểm / Lưu ý */}
                  <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5 uppercase">
                      <i className="fa-solid fa-triangle-exclamation text-rose-500" />
                      {t("aiPlanner.stopCons")}
                    </span>
                    <ul className="space-y-1.5">
                      {stop.cons.map((con, cIdx) => (
                        <li
                          key={cIdx}
                          className="text-xs text-rose-900 dark:text-rose-200 font-medium flex items-start gap-2"
                        >
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION: ĐỀ XUẤT THAM GIA CHUNG (MỜI BẠN BÈ KHÔNG CẦN ĐĂNG NHẬP) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#FFCB37] text-black flex items-center justify-center font-black text-sm shadow-xs">
                    <i className="fa-solid fa-share-nodes" />
                  </span>
                  <h3 className="text-base font-black text-black dark:text-white">
                    {t("aiPlanner.groupInviteTitle")}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {t("aiPlanner.groupInviteDesc")}
                </p>
              </div>

              <Button
                type="primary"
                onClick={generateSharedLink}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 h-auto text-xs rounded-2xl shadow-md border-none flex items-center gap-2 transition-transform hover:scale-105"
              >
                <i className="fa-solid fa-link text-sm" />
                <span>{t("aiPlanner.btnExportLink")}</span>
              </Button>
            </div>

            {exportedShareUrl && (
              <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check" />
                  {t("aiPlanner.yourInviteLink")}
                </span>
                <input
                  type="text"
                  readOnly
                  value={exportedShareUrl}
                  className="flex-1 min-w-[200px] text-xs bg-transparent border-none text-gray-800 dark:text-gray-200 font-mono focus:outline-none select-all"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(exportedShareUrl);
                      message.success(
                        currentLanguage === "en"
                          ? "Copied invite link!"
                          : "Đã sao chép link mời!",
                      );
                    }}
                    className="rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800"
                  >
                    <i className="fa-regular fa-copy mr-1" />
                    {t("aiPlanner.btnCopy")}
                  </Button>
                  <a
                    href={exportedShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black text-xs font-black rounded-xl"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    {t("aiPlanner.btnPreview")}
                  </a>
                </div>
              </div>
            )}

            {exportedPlanId && (
              <a
                href={`/plans/responses?plan=${encodeURIComponent(exportedPlanId)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl px-4 py-3 hover:border-amber-400 hover:shadow-sm transition-all"
              >
                <span className="text-xs font-black text-black dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-calendar-check text-amber-500" />
                  {currentLanguage === "en"
                    ? "Group responses & AI common schedule"
                    : "Phản hồi của nhóm & AI tìm lịch chung"}
                </span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  {currentLanguage === "en"
                    ? "Open dashboard"
                    : "Mở bảng điều khiển"}
                  <i className="fa-solid fa-arrow-right ml-1.5" />
                </span>
              </a>
            )}
          </div>

          {/* General Advice */}
          {aiResult.general_advice && (
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex items-start gap-3">
              <i className="fa-solid fa-lightbulb text-blue-500 text-lg mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                  {t("aiPlanner.hostAdviceTitle")}
                </span>
                <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
                  {aiResult.general_advice}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
            <Button
              type="primary"
              onClick={handleSaveAIPlan}
              loading={isSaving}
              className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black py-3.5 rounded-2xl h-auto text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <i className="fa-solid fa-bookmark" />
              <span>{t("aiPlanner.btnSavePlan")}</span>
            </Button>

            <Button
              onClick={generateSharedLink}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-black py-3.5 rounded-2xl h-auto text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <i className="fa-solid fa-link" />
              <span>{t("aiPlanner.btnExportShare")}</span>
            </Button>

            <Button
              onClick={copyShareText}
              className="border-amber-400 text-black dark:text-white font-bold py-3.5 rounded-2xl h-auto text-xs flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-gray-800"
            >
              <i className="fa-solid fa-share-nodes text-amber-500" />
              <span>{t("aiPlanner.btnCopyZalo")}</span>
            </Button>

            <Button
              onClick={() => setAiResult(null)}
              className="border-gray-200 text-gray-500 font-bold py-3.5 rounded-2xl h-auto text-xs hover:text-black"
            >
              <i className="fa-solid fa-rotate-left mr-1.5" />
              <span>{t("aiPlanner.btnCreateAnother")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Share Modal Dialog */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-black">
            <i className="fa-solid fa-link text-emerald-500" />
            <span>{t("aiPlanner.modalShareTitle")}</span>
          </div>
        }
        open={isShareModalOpen}
        onCancel={() => setIsShareModalOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsShareModalOpen(false)}
            className="rounded-xl font-bold text-xs"
          >
            {t("aiPlanner.btnClose")}
          </Button>,
          <a
            key="open"
            href={exportedShareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#FFCB37] text-black font-black px-4 py-2 rounded-xl text-xs ml-2"
          >
            <i className="fa-solid fa-arrow-up-right-from-square" />
            {t("aiPlanner.btnOpenNow")}
          </a>,
        ]}
        className="rounded-3xl"
      >
        <div className="py-4 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            {t("aiPlanner.modalShareDesc")}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-700 dark:text-gray-300">
              {t("aiPlanner.modalShareLink")}
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={exportedShareUrl}
                className="font-mono text-xs rounded-xl py-2"
              />
              <Button
                type="primary"
                onClick={() => {
                  navigator.clipboard.writeText(exportedShareUrl);
                  message.success(
                    currentLanguage === "en"
                      ? "Copied invite link to clipboard!"
                      : "Đã sao chép link mời vào clipboard!",
                  );
                }}
                className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl text-xs font-black px-4"
              >
                {t("aiPlanner.btnCopy")}
              </Button>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <i className="fa-solid fa-circle-check" />
              {t("aiPlanner.modalShareCan")}
            </p>
            <ul className="list-disc list-inside space-y-0.5 opacity-90">
              <li>{t("aiPlanner.modalShareCan1")}</li>
              <li>{t("aiPlanner.modalShareCan2")}</li>
              <li>{t("aiPlanner.modalShareCan3")}</li>
            </ul>
          </div>

          {exportedPlanId && (
            <div className="pt-1">
              <a
                href={`/plans/responses?plan=${encodeURIComponent(exportedPlanId)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 font-bold py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:border-amber-400 transition-colors"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-amber-500" />
                <span>
                  {currentLanguage === "en"
                    ? "View responses & merge with AI"
                    : "Xem phản hồi & AI tìm lịch chung"}
                </span>
                <i className="fa-solid fa-arrow-right text-[10px] ml-1" />
              </a>
            </div>
          )}
        </div>
      </Modal>

      {/* Plan Saved Success Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-black text-emerald-600 dark:text-emerald-400">
            <i className="fa-solid fa-circle-check text-lg" />
            <span>{t("aiPlanner.modalSaveTitle")}</span>
          </div>
        }
        open={isSaveSuccessModalOpen}
        onCancel={() => {
          setIsSaveSuccessModalOpen(false);
          onPlanSaved();
        }}
        footer={[
          <Button
            key="list"
            onClick={() => {
              setIsSaveSuccessModalOpen(false);
              onPlanSaved();
            }}
            className="rounded-xl font-bold text-xs"
          >
            {t("aiPlanner.btnBackToList")}
          </Button>,
          <a
            key="view"
            href={exportedShareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black px-4 py-2 rounded-xl text-xs ml-2 shadow-xs"
          >
            <i className="fa-solid fa-eye" />
            <span>{t("aiPlanner.btnViewDetail")}</span>
          </a>,
        ]}
        className="rounded-3xl"
      >
        <div className="py-4 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-2">
            <h4 className="text-sm font-black text-black dark:text-white">
              {aiResult?.summary}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-bold">
                🗓️{" "}
                {selectedDate
                  ? selectedDate.format("DD/MM/YYYY")
                  : currentLanguage === "en"
                    ? "Today"
                    : "Hôm nay"}
              </span>
              <span>•</span>
              <span className="font-bold">
                👥 {participants} {t("aiPlanner.people")}
              </span>
              <span>•</span>
              <span className="font-bold">✨ {aiResult?.meeting_vibe}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            {t("aiPlanner.modalSaveDesc")}
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href={exportedShareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-gradient-to-r from-amber-400 to-[#FF9F1C] text-black font-black py-3 rounded-2xl text-xs shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>{t("aiPlanner.btnSaveViewDetailNow")}</span>
            </a>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(exportedShareUrl);
                message.success(
                  currentLanguage === "en"
                    ? "Copied invite link to clipboard!"
                    : "Đã sao chép link mời tham gia chung!",
                );
              }}
              className="w-full text-center border border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-link" />
              <span>{t("aiPlanner.btnSaveCopyInvite")}</span>
            </Button>

            {exportedPlanId && (
              <a
                href={`/plans/responses?plan=${encodeURIComponent(exportedPlanId)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center border border-amber-400 text-amber-700 dark:text-amber-400 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-calendar-check" />
                <span>
                  {currentLanguage === "en"
                    ? "Group responses & AI schedule"
                    : "Phản hồi nhóm & AI tìm lịch chung"}
                </span>
              </a>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
