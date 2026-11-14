import React, { useState, useEffect } from "react";
import {
  Button,
  Slider,
  Checkbox,
  Modal,
  DatePicker,
  message,
  Card,
} from "antd";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import RepositoryManager from "../../data/repositoryManager";
import useLanguageStore from "../../stores/languageStore.ts";
import SmartAIPlanner from "./components/SmartAIPlanner.tsx";

interface SavedPlan {
  id: number;
  budget_input: number;
  total_estimated: number;
  created_at: string;
  scheduled_at: string | null;
  is_saved: boolean;
  places: any[];
}

export default function CustomerPlans() {
  const { t } = useLanguageStore();
  const location = useLocation();
  const [step, setStep] = useState<"list" | "create" | "preview" | "ai_planner">(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "ai" ? "ai_planner" : "list";
  });
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenPlanDetail = (plan: SavedPlan) => {
    // Check if this plan has saved rich AI data in localStorage
    const savedLocal = localStorage.getItem(`trove_plan_${plan.id}`);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        setSelectedPlanDetail(parsed);
        setIsDetailModalOpen(true);
        return;
      } catch (e) {
        console.warn("Failed to parse local plan detail", e);
      }
    }

    // Fallback: construct plan detail object from plan and its places
    const constructed = {
      id: plan.id.toString(),
      summary: plan.places.map((p) => p.name).join(" → ") || "Kế hoạch gặp mặt",
      meeting_vibe: "Gặp gỡ vui vẻ & trải nghiệm",
      participants: 2,
      date: plan.scheduled_at ? dayjs(plan.scheduled_at).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
      budget: plan.budget_input,
      total_estimated: plan.total_estimated,
      schedule: (plan.places || []).map((p: any, idx: number) => ({
        time: idx === 0 ? "18:30 - 20:30" : "20:30 - 22:00",
        activity_type: p.categories?.[0]?.name || "Ăn uống / Thư giãn",
        place_name: p.name,
        address: p.address || "Đang cập nhật địa chỉ",
        estimated_cost: p.average_price ? `${Number(p.average_price).toLocaleString("vi-VN")} VNĐ` : "Tùy món",
        vegetarian_friendly: p.description?.toLowerCase().includes("chay") || false,
        vegetarian_status: p.description?.toLowerCase().includes("chay")
          ? "Có phục vụ món chay"
          : "Không có thông tin món chay riêng",
        why_suitable: p.description || "Địa điểm phù hợp với kế hoạch gặp gỡ nhóm",
        pros: ["Không gian thoải mái, tiện di chuyển"],
        cons: ["Nên liên hệ trước khi đến vào giờ cao điểm"],
      })),
      general_advice: "Vui lòng đặt bàn sớm để nhóm có chỗ ngồi thoải mái nhất.",
    };

    setSelectedPlanDetail(constructed);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "ai") {
      setStep("ai_planner");
    }
  }, [location.search]);

  // Form states
  const [budget, setBudget] = useState<number>(400000); // Default 400k
  const [distance, setDistance] = useState<number>(5);
  const [useDistance, setUseDistance] = useState<boolean>(true);
  const [activityGroups, setActivityGroups] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  // Generated preview states
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);

  // Modal Datepicker states
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Fetch saved plans and active activity groups
  const fetchSavedPlans = async () => {
    try {
      setLoading(true);
      const res = await RepositoryManager.plans.getSavedPlans({ per_page: 50 });
      if (res && res.success) {
        const rawPlans = res.data?.data || res.data || [];
        setSavedPlans(Array.isArray(rawPlans) ? rawPlans : []);
      }
    } catch (e) {
      console.error("Failed to load saved plans", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlans();

    // Fetch activity groups
    const fetchGroups = async () => {
      try {
        const res = await RepositoryManager.activityGroups.getGroups();
        if (res && res.success) {
          const rawList = res.data?.data || res.data || [];
          const list = Array.isArray(rawList) ? rawList : [];
          setActivityGroups(list);
          // By default, select first group
          if (list.length > 0) {
            setSelectedActivities([list[0].id]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch activity groups", e);
      }
    };
    fetchGroups();
  }, []);

  // Format money helper
  const formatMoney = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
    }
    return `${Math.round(val / 1000)}k`;
  };

  const handleGenerate = async () => {
    if (selectedActivities.length === 0) {
      message.error("Vui lòng chọn ít nhất 1 hoạt động!");
      return;
    }
    try {
      setLoading(true);
      const payload: any = {
        budget: budget,
        activity_groups: selectedActivities,
        save_plan: false,
      };

      if (useDistance) {
        payload.filters = {
          distance_km: distance,
          latitude: 16.0544, // Default Da Nang coordinates
          longitude: 108.2022,
        };
      }

      const res = await RepositoryManager.plans.generatePlan(payload);
      if (res && res.success && res.data) {
        setPreviewData(res.data);
        const placeIds = (res.data.places || []).map((p: any) => p.id);
        setSelectedPlaceIds(placeIds);
        setStep("preview");
      } else {
        message.error(
          res?.message || "Không thể tạo kế hoạch. Vui lòng thử lại!",
        );
      }
    } catch (e: any) {
      console.error(e);
      const serverMessage =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        "Đã xảy ra lỗi khi tạo kế hoạch!";
      message.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!selectedDate) {
      message.error("Vui lòng chọn ngày!");
      return;
    }
    try {
      setLoading(true);
      const totalEstimated = (previewData?.places || [])
        .filter((p: any) => selectedPlaceIds.includes(p.id))
        .reduce((sum: number, p: any) => sum + (p.average_price || 0), 0);

      const payload = {
        budget: budget,
        activity_groups: selectedActivities,
        place_ids: selectedPlaceIds,
        total_estimated: totalEstimated || budget,
        filters: {
          date: selectedDate.format("YYYY-MM-DD HH:mm"),
        },
      };

      const res = await RepositoryManager.plans.saveNewPlan(payload);
      if (res && res.success) {
        message.success("Lưu kế hoạch thành công!");
        setIsDateModalOpen(false);
        setStep("list");
        fetchSavedPlans();
      } else {
        message.error(res?.message || "Lỗi khi lưu kế hoạch!");
      }
    } catch (e: any) {
      console.error(e);
      message.error("Đã xảy ra lỗi khi lưu kế hoạch!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      await RepositoryManager.plans.deletePlan(id);
      message.success("Đã xóa kế hoạch thành công!");
      fetchSavedPlans();
    } catch (e) {
      console.error(e);
      message.error("Không thể xóa kế hoạch!");
    }
  };

  const toggleActivity = (id: number) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id],
    );
  };

  const togglePlaceSelection = (id: number) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id],
    );
  };

  const totalEstimatedCost = (previewData?.places || [])
    .filter((p: any) => selectedPlaceIds.includes(p.id))
    .reduce((sum: number, p: any) => sum + (p.average_price || 0), 0);

  // STEP: AI PLANNER VIEW
  if (step === "ai_planner") {
    return (
      <SmartAIPlanner
        onBack={() => setStep("list")}
        onPlanSaved={() => {
          setStep("list");
          fetchSavedPlans();
        }}
      />
    );
  }

  // STEP 1: PLANS LIST VIEW
  if (step === "list") {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display">
              {t("publicPlaces.myPlans")}
            </h1>
            <p className="text-gray-500 font-semibold text-sm">
              {t("publicPlaces.myPlansSub")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              onClick={() => setStep("ai_planner")}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-[#FF9F1C] hover:opacity-95 text-black border-none font-black px-5 py-2.5 h-auto rounded-2xl flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm animate-pulse" />
              <span>{t("publicPlaces.btnAiPlanner")}</span>
            </Button>
            {savedPlans.length > 0 && (
              <Button
                onClick={() => setStep("create")}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold px-4 py-2.5 h-auto rounded-2xl flex items-center gap-1.5 hover:border-amber-400"
              >
                <i className="fa-solid fa-plus text-xs" />
                <span>{t("publicPlaces.createPlan")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Smart AI Planner Hero Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-amber-500 via-[#FF9F1C] to-yellow-500 p-6 text-black shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/15 px-2.5 py-0.5 rounded-full">
                {t("publicPlaces.aiBannerTag")}
              </span>
              <span className="text-[10px] font-bold text-black/80">
                {t("publicPlaces.aiBannerSub")}
              </span>
            </div>
            <h3 className="text-xl font-black text-black">
              {t("publicPlaces.aiBannerTitle")}
            </h3>
            <p className="text-xs font-semibold text-black/85 leading-relaxed">
              {t("publicPlaces.aiBannerDesc")}
            </p>
          </div>
          <Button
            type="primary"
            onClick={() => setStep("ai_planner")}
            className="z-10 bg-black text-white hover:bg-gray-900 border-none font-black px-6 py-3 h-auto rounded-2xl flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-amber-400" />
            <span>{t("publicPlaces.btnTryAiNow")}</span>
          </Button>
          <i className="fa-solid fa-robot absolute -right-4 -bottom-6 text-8xl text-black/10 pointer-events-none" />
        </div>

        {/* Saved Plans List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-semibold">
            {t("publicPlaces.loadingPlans")}
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <i className="fa-regular fa-calendar-alt text-4xl text-[#FFCB37]" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-black dark:text-white">
                {t("publicPlaces.noPlanYet")}
              </h2>
              <p className="text-gray-400 font-semibold text-sm">
                {t("publicPlaces.noPlanDesc")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="primary"
                onClick={() => setStep("ai_planner")}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-[#FF9F1C] hover:opacity-95 text-black border-none font-black px-6 py-3.5 h-auto text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-base" />
                <span>{t("publicPlaces.btnAiSmartPlanner")}</span>
              </Button>
              <Button
                onClick={() => setStep("create")}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold px-6 py-3.5 h-auto text-sm rounded-2xl hover:border-amber-400"
              >
                <i className="fa-solid fa-plus mr-1.5" />
                <span>{t("publicPlaces.createPlan")} {t("publicPlaces.btnManual")}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPlans.map((plan) => (
              <Card
                key={plan.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-md relative overflow-visible flex flex-col justify-between"
                bodyStyle={{ padding: 0 }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                        <i className="fa-solid fa-calendar-days text-[9px]" />
                        {plan.scheduled_at
                          ? `${t("publicPlaces.planDate")} ${dayjs(plan.scheduled_at).format("DD/MM/YYYY")}`
                          : t("publicPlaces.planDate")}
                      </span>
                      <h3 className="text-base font-black text-black dark:text-white leading-snug">
                        {plan.places.map((p) => p.name).join(" → ") ||
                          "Trove Plan"}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <i className="fa-solid fa-trash-can text-sm" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-855 rounded-2xl p-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold block mb-0.5">
                        {t("publicPlaces.budgetLabel")}
                      </span>
                      <strong className="text-black dark:text-white font-bold">
                        {formatMoney(plan.budget_input)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block mb-0.5">
                        {t("publicPlaces.estCost")}
                      </span>
                      <strong className="text-red-500 font-bold">
                        {formatMoney(plan.total_estimated)}
                      </strong>
                    </div>
                  </div>

                  {/* Place chips path */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      {t("publicPlaces.placesLabel")}
                    </span>
                    <div className="space-y-1.5">
                      {plan.places.map((place, idx) => (
                        <div
                          key={place.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[#FFCB37] font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold truncate text-black dark:text-white">
                            {place.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons on card */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <Button
                      type="primary"
                      onClick={() => handleOpenPlanDetail(plan)}
                      className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <i className="fa-solid fa-eye" />
                      <span>{t("publicPlaces.btnViewPlanDetail")}</span>
                    </Button>
                    <Button
                      onClick={() => {
                        const savedLocal = localStorage.getItem(`trove_plan_${plan.id}`);
                        let dataToEncode = savedLocal ? JSON.parse(savedLocal) : null;
                        if (!dataToEncode) {
                          dataToEncode = {
                            id: plan.id.toString(),
                            summary: plan.places.map((p) => p.name).join(" → "),
                            participants: 2,
                            date: plan.scheduled_at ? dayjs(plan.scheduled_at).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
                            schedule: plan.places.map((p) => ({
                              time: "19:00",
                              activity_type: "Gặp mặt",
                              place_name: p.name,
                              address: p.address,
                              estimated_cost: `${p.average_price || 0}đ`,
                              vegetarian_friendly: false,
                              vegetarian_status: "Bình thường",
                              why_suitable: p.description,
                              pros: [],
                              cons: [],
                            })),
                          };
                        }
                        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(dataToEncode)))));
                        const url = `${window.location.origin}/plans/shared?data=${encoded}`;
                        navigator.clipboard.writeText(url);
                        message.success(t("aiPlanner.modalSaveDesc") ? "Link copied!" : "Đã sao chép link!");
                      }}
                      className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-share-nodes text-amber-500" />
                      <span>{t("publicPlaces.btnShare")}</span>
                    </Button>
                    <a
                      href={`/plans/responses?plan=${encodeURIComponent(plan.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Phản hồi nhóm & AI tìm lịch chung"
                      className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 hover:border-amber-400 transition-colors"
                    >
                      <i className="fa-solid fa-calendar-check text-amber-500" />
                      <span>Lịch nhóm</span>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Plan Detail Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-base font-black">
              <i className="fa-solid fa-map-location-dot text-amber-500" />
              <span>{t("publicPlaces.modalDetailTitle")}</span>
            </div>
          }
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          width={700}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)} className="rounded-xl font-bold text-xs">
              {t("publicPlaces.close")}
            </Button>,
            <a
              key="share-link"
              href={`/plans/shared?data=${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(selectedPlanDetail || {})))))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black px-4 py-2 rounded-xl text-xs ml-2 shadow-xs"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>{t("publicPlaces.modalOpenSharedPage")}</span>
            </a>,
          ]}
          className="rounded-3xl"
        >
          {selectedPlanDetail && (
            <div className="py-2 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                <h3 className="text-base font-black text-black dark:text-white">
                  {selectedPlanDetail.summary}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span>🗓️ {selectedPlanDetail.date}</span>
                  <span>•</span>
                  <span>👥 {selectedPlanDetail.participants || 2} {t("aiPlanner.people")}</span>
                  {selectedPlanDetail.meeting_vibe && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400">✨ {selectedPlanDetail.meeting_vibe}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  {t("publicPlaces.destinationsList")}
                </h4>

                {(selectedPlanDetail.schedule || []).map((stop: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-sm font-black text-black dark:text-white">
                            {stop.place_name}
                          </h5>
                          <p className="text-xs text-gray-400 font-medium">
                            {stop.address}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-white dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                        {stop.time}
                      </span>
                    </div>

                    {/* Vegetarian badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                          stop.vegetarian_friendly
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <i className={`fa-solid ${stop.vegetarian_friendly ? "fa-leaf text-emerald-500" : "fa-utensils text-gray-400"}`} />
                        <span>{stop.vegetarian_status || (stop.vegetarian_friendly ? t("aiPlanner.stopVegYes") : t("aiPlanner.stopVegNo"))}</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.place_name} ${stop.address}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <i className="fa-solid fa-location-arrow text-[10px]" />
                        {t("publicPlaces.mapsDirections")}
                      </a>
                    </div>

                    {stop.why_suitable && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                        💡 {stop.why_suitable}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // STEP 2: CREATE DATE PLAN FORM
  if (step === "create") {
    return (
      <div className="w-full max-w-lg mx-auto py-6 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => setStep("list")}
            className="rounded-full flex items-center justify-center w-10 h-10 border-gray-200"
          >
            <i className="fa-solid fa-arrow-left text-black dark:text-white" />
          </Button>
          <h2 className="text-2xl font-black text-black dark:text-white">
            {t("publicPlaces.createPlan")}
          </h2>
        </div>

        {/* Switch to AI Mode banner */}
        <div
          onClick={() => setStep("ai_planner")}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-wand-magic-sparkles" />
            </div>
            <div>
              <span className="text-xs font-black text-black dark:text-white block">
                Muốn AI đọc review & khớp lịch gặp mặt?
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Tự động lọc món chay, bãi đỗ xe, karaoke, ưu & nhược điểm
              </span>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-xs text-amber-500" />
        </div>

        <div className="space-y-8">
          {/* BUDGET SELECTOR */}
          <div className="space-y-3">
            <span className="font-black text-sm text-black dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-wallet text-gray-400" />{" "}
              {t("publicPlaces.wallet")}
            </span>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: 150000,
                  label: "Dưới 200k",
                  icon: "fa-solid fa-dollar-sign",
                },
                {
                  value: 400000,
                  label: "200k - 500k",
                  icon: "fa-solid fa-circle-dollar-to-slot",
                },
                { value: 800000, label: "Trên 500k", icon: "fa-solid fa-gem" },
              ].map((item) => {
                const isActive = budget === item.value;
                return (
                  <div
                    key={item.value}
                    onClick={() => setBudget(item.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white dark:bg-gray-900 ${
                      isActive
                        ? "border-[#FFCB37] bg-[#FFCB37]/5 shadow-[0_8px_20px_rgba(255,203,55,0.15)]"
                        : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <i
                      className={`${item.icon} text-lg mb-2 ${isActive ? "text-[#FFCB37]" : "text-gray-400"}`}
                    />
                    <span className="text-xs font-bold text-center text-black dark:text-white leading-tight">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTANCE SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-black dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-location-arrow text-gray-400" />{" "}
                {t("publicPlaces.distance")}
              </span>
              <Checkbox
                checked={useDistance}
                onChange={(e) => setUseDistance(e.target.checked)}
              />
            </div>

            {useDistance && (
              <div className="space-y-1">
                <Slider
                  min={1}
                  max={30}
                  value={distance}
                  onChange={(val) => setDistance(val)}
                  trackStyle={{ backgroundColor: "#FFCB37" }}
                  handleStyle={{
                    borderColor: "#FFCB37",
                    backgroundColor: "#FFCB37",
                  }}
                />
                <div className="flex justify-end text-xs font-bold text-gray-500">
                  {distance} km
                </div>
              </div>
            )}
          </div>

          {/* ACTIVITIES SELECTOR */}
          <div className="space-y-3">
            <span className="font-black text-sm text-black dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-shapes text-gray-400" />{" "}
              {t("publicPlaces.activities")}
            </span>
            <div className="flex flex-wrap gap-2">
              {activityGroups.length === 0 ? (
                <div className="text-xs text-gray-400">
                  Đang tải hoạt động...
                </div>
              ) : (
                activityGroups.map((group) => {
                  const isActive = selectedActivities.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      onClick={() => toggleActivity(group.id)}
                      className={`px-4 py-2 rounded-full font-bold text-xs transition-all border ${
                        isActive
                          ? "bg-[#FFCB37] text-black border-transparent shadow-md"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {group.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <Button
            type="primary"
            onClick={handleGenerate}
            loading={loading}
            disabled={selectedActivities.length === 0}
            className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black py-4 rounded-2xl h-auto text-base shadow-[0_8px_20px_rgba(255,203,55,0.2)] flex items-center justify-center"
          >
            {t("publicPlaces.createPlan")}
          </Button>
        </div>
      </div>
    );
  }

  // STEP 3: PLAN PREVIEW (PLAN GENERATED)
  if (step === "preview") {
    const places = previewData?.places || [];
    return (
      <div className="w-full max-w-lg mx-auto py-6 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => setStep("create")}
            className="rounded-full flex items-center justify-center w-10 h-10 border-gray-200"
          >
            <i className="fa-solid fa-arrow-left text-black dark:text-white" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-black dark:text-white">
              {t("publicPlaces.planGenerated")}
            </h2>
            <p className="text-gray-500 font-semibold text-xs">
              {t("publicPlaces.refineItinerary")}
            </p>
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3.5 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">
              {t("publicPlaces.budgetLabel").replace(":", "")}
            </span>
            <span className="font-bold text-sm text-[#FFCB37]">
              {formatMoney(budget)}
            </span>
          </div>
          <div className="h-[1px] bg-gray-50 dark:bg-gray-850" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">
              {t("publicPlaces.estTotal")}
            </span>
            <span className="font-bold text-sm text-red-500">
              {formatMoney(totalEstimatedCost)}
            </span>
          </div>
          <div className="h-[1px] bg-gray-50 dark:bg-gray-850" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">
              {t("publicPlaces.selectedPlacesCount")}
            </span>
            <span className="font-bold text-sm text-blue-500">
              {selectedPlaceIds.length} / {places.length}
            </span>
          </div>
        </div>

        {/* Place Itinerary List */}
        <div className="space-y-4 mb-8">
          <span className="font-black text-sm text-black dark:text-white flex items-center gap-2">
            {t("publicPlaces.detailItinerary")}
          </span>
          <p className="text-[10px] text-gray-400 font-semibold -mt-2">
            {t("publicPlaces.selectKeepPlace")}
          </p>

          <div className="space-y-3">
            {places.map((place: any, index: number) => {
              const isChecked = selectedPlaceIds.includes(place.id);
              return (
                <div
                  key={place.id}
                  onClick={() => togglePlaceSelection(place.id)}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-gray-900 ${
                    isChecked
                      ? "border-[#FFCB37] bg-[#FFCB37]/5"
                      : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    className="pointer-events-none shrink-0 scale-110"
                  />

                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                    {place.image || place.image_url ? (
                      <img
                        src={place.image || place.image_url}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-500 font-bold text-lg">
                        {place.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute top-1 left-1 bg-black/60 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-black dark:text-white truncate">
                      {place.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate">
                      {place.address || place.location}
                    </p>
                    <span className="text-[10px] font-bold text-red-500 mt-1 block">
                      ~{formatMoney(place.average_price || 200000)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGenerate}
            loading={loading}
            className="w-full border-[#FFCB37] hover:border-[#FFCB37]/90 text-[#FFCB37] hover:text-[#FFCB37]/90 bg-transparent font-bold py-3.5 rounded-2xl h-auto text-sm flex items-center justify-center gap-1.5"
          >
            <i className="fa-solid fa-rotate-left" />{" "}
            {t("publicPlaces.recreatePlan")}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setStep("list")}
              className="w-full border-gray-200 text-gray-500 font-bold py-3.5 rounded-2xl h-auto text-sm"
            >
              {t("publicPlaces.close")}
            </Button>
            <Button
              onClick={() => {
                setSelectedDate(dayjs());
                setIsDateModalOpen(true);
              }}
              type="primary"
              disabled={selectedPlaceIds.length === 0}
              className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-bold py-3.5 rounded-2xl h-auto text-sm"
            >
              {t("publicPlaces.savePlanBtn")}
            </Button>
          </div>
        </div>

        {/* Date Selector Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calendar-day text-[#FFCB37] text-xl" />
              <span className="text-base font-black text-black">
                {t("publicPlaces.selectDateTitle")}
              </span>
            </div>
          }
          open={isDateModalOpen}
          onCancel={() => setIsDateModalOpen(false)}
          onOk={handleSavePlan}
          okText={t("publicPlaces.saveBtn")}
          cancelText={t("publicPlaces.cancelBtn")}
          okButtonProps={{
            className:
              "bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-bold rounded-xl",
          }}
          cancelButtonProps={{
            className: "rounded-xl font-bold",
          }}
          width={360}
          className="rounded-[32px] custom-date-modal"
        >
          <div className="py-6 flex justify-center">
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full rounded-xl py-2.5 border-gray-200"
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: "HH:mm" }}
            />
          </div>
        </Modal>
      </div>
    );
  }

  return null;
}
