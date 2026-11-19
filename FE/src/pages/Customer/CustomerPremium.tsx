import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import useCustomerStore from "../../stores/customerStore";

type PlanTier = "free" | "gold" | "diamond";
type PaymentMethodType = "qr" | "momo" | "card";

interface PlanConfig {
  id: "gold" | "diamond";
  name: string;
  shortName: string;
  price: number;
  priceText: string;
  duration: string;
  tagText: string;
  subtitle: string;
  aiQuotaText: string;
  placesBenefit: string;
  badgeName: string;
  supportText: string;
  anonymousAllowed: boolean;
  features: string[];
}

const VIP_PLANS: Record<"gold" | "diamond", PlanConfig> = {
  gold: {
    id: "gold",
    name: "VIP Vàng",
    shortName: "Vàng",
    price: 59000,
    priceText: "59.000 VNĐ",
    duration: "1 tháng",
    tagText: "GOLD MEMBER",
    subtitle: "Trải nghiệm khám phá nâng cao & hỗ trợ ưu tiên mỗi ngày",
    aiQuotaText: "0/3 lượt hôm nay",
    placesBenefit: "Khám phá các địa điểm độc quyền",
    badgeName: "Huy hiệu Vàng",
    supportText: "Hỗ trợ ưu tiên",
    anonymousAllowed: false,
    features: [
      "AI Plan: 3 lượt / ngày",
      "Khám phá các địa điểm độc quyền",
      "Huy hiệu Vàng nổi bật trên hồ sơ & bài viết",
      "Hỗ trợ ưu tiên 24/7",
    ],
  },
  diamond: {
    id: "diamond",
    name: "VIP Kim Cương",
    shortName: "Kim Cương",
    price: 199000,
    priceText: "199.000 VNĐ",
    duration: "1 tháng",
    tagText: "BEST VALUE • NỔI BẬT NHẤT",
    subtitle: "Đặc quyền tối thượng không giới hạn cho tín đồ xê dịch",
    aiQuotaText: "Không giới hạn ∞",
    placesBenefit: "Khám phá các địa điểm độc quyền",
    badgeName: "Huy hiệu Kim Cương",
    supportText: "Hỗ trợ ưu tiên cao nhất",
    anonymousAllowed: true,
    features: [
      "AI Plan: Không giới hạn (∞)",
      "Khám phá các địa điểm độc quyền",
      "Huy hiệu Kim Cương ánh xanh tím lấp lánh",
      "Hỗ trợ ưu tiên cao nhất",
      "Đặc quyền Đăng bài ẩn danh",
    ],
  },
};

export default function CustomerPremium() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCustomerStore();

  // Nếu người dùng đang mở trực tiếp URL /payment thì bắt đầu ở Step 2, ngược lại Step 1
  const initialStep = location.pathname === "/payment" ? 2 : 1;
  const initialPkg =
    searchParams.get("package") === "gold" ? "gold" : "diamond";

  // State quản lý luồng 3 màn hình: 1 = Chọn gói | 2 = Thanh toán (UI) | 3 = Quản lý VIP
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [selectedPlanId, setSelectedPlanId] = useState<"gold" | "diamond">(
    initialPkg
  );
  const [userTier, setUserTier] = useState<PlanTier>("free");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("qr");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anonymousToggle, setAnonymousToggle] = useState<boolean>(true);

  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg === "gold" || pkg === "diamond") {
      setSelectedPlanId(pkg);
    }
  }, [searchParams]);

  // Tính ngày hết hạn giả lập (+30 ngày kể từ hôm nay)
  const expiryDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const currentPlan = VIP_PLANS[selectedPlanId];
  const activeVipPlan =
    userTier === "gold" ? VIP_PLANS.gold : VIP_PLANS.diamond;
  const displayUserName = user?.name || "Nguyễn Minh Khôi (Demo User)";

  // Kiểm tra trường hợp đang ở VIP Vàng và chọn nâng cấp lên VIP Kim Cương (bù thêm 140.000đ)
  const isUpgradingFromGold =
    userTier === "gold" && selectedPlanId === "diamond";
  const checkoutPrice = isUpgradingFromGold ? 140000 : currentPlan.price;
  const checkoutPriceText = isUpgradingFromGold
    ? "140.000 VNĐ"
    : currentPlan.priceText;

  // Chọn gói ở Màn hình 1 -> sang Màn hình 2
  const handleSelectPlan = (planId: "gold" | "diamond") => {
    setSelectedPlanId(planId);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Nâng cấp từ VIP Vàng (Màn hình 3) lên VIP Kim Cương (+140k) -> sang Màn hình 2
  const handleUpgradeToDiamond = () => {
    setSelectedPlanId("diamond");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xác nhận thanh toán giả lập ở Màn hình 2 -> Loading 1s -> sang Màn hình 3
  const handleConfirmPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setUserTier(selectedPlanId);
      setAnonymousToggle(selectedPlanId === "diamond");
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1000);
  };

  // Reset Demo ở Màn hình 3 -> Về Màn hình 1
  const handleResetDemo = () => {
    setIsLoading(false);
    setUserTier("free");
    setSelectedPlanId("diamond");
    setPaymentMethod("qr");
    setStep(1);
    if (location.pathname === "/payment") {
      navigate("/premium", { replace: true });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full py-10 px-4 sm:px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* =========================================================
            THANH TRẠNG THÁI (ẨN CÁC BƯỚC ĐÃ QUA KHI ĐÃ LÀ VIP)
        ========================================================= */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-amber-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
            {step === 3 ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white dark:bg-amber-400 dark:text-black shadow-sm flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-xs" />
                <span>Quản lý gói VIP của bạn</span>
              </div>
            ) : (
              [
                { id: 1, label: "1. Chọn gói VIP" },
                { id: 2, label: "2. Xác nhận thanh toán" },
                { id: 3, label: "3. Quản lý gói VIP" },
              ]
                .filter((item) => {
                  // Nếu đã là VIP Vàng đang nâng cấp lên Kim Cương ở B2 thì ẩn luôn B1
                  if (userTier !== "free" && item.id === 1) return false;
                  // Ẩn các bước đã đi qua
                  return item.id >= step;
                })
                .map((item, idx, arr) => {
                  const isCurrent = step === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <div
                        className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 select-none ${
                          isCurrent
                            ? "bg-gray-900 text-white dark:bg-amber-400 dark:text-black shadow-sm"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        }`}
                      >
                        <span>{item.label}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })
            )}
          </div>

          {/* Trạng thái User hiện tại */}
          <div className="flex items-center gap-2 text-xs font-bold bg-amber-50/80 dark:bg-gray-800 px-3.5 py-1.5 rounded-xl border border-amber-200/60 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">
              Trạng thái User:
            </span>
            {userTier === "free" && (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                Free (Người dùng thường)
              </span>
            )}
            {userTier === "gold" && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAB308] text-black flex items-center gap-1">
                <i className="fa-solid fa-crown text-[10px]" /> VIP Vàng
              </span>
            )}
            {userTier === "diamond" && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center gap-1">
                <i className="fa-solid fa-gem text-[10px]" /> VIP Kim Cương
              </span>
            )}
          </div>
        </div>

        {/* =========================================================
            MÀN HÌNH 1: TRANG CHỌN GÓI (PRICING / VIP PLANS)
        ========================================================= */}
        {step === 1 && (
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                <i className="fa-solid fa-crown text-amber-500" />
                Nâng cấp đặc quyền VIP Trove
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                Chọn Gói VIP Của Bạn
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                Mở khóa trợ lý lập lịch trình AI, khám phá địa điểm bí mật và sở
                hữu huy hiệu thành viên danh giá trên Trove.
              </p>
            </div>

            {/* Thông tin gói Free hiện tại */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-user" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-gray-900 dark:text-white">
                      Gói Free (Người dùng thường)
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      Mặc định
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    AI Plan giới hạn cơ bản • Địa điểm cộng đồng • Không có huy
                    hiệu • Đăng bài công khai
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0">
                Chọn 1 trong 2 gói VIP bên dưới để nâng cấp
              </span>
            </div>

            {/* 2 Card chọn gói: VIP Vàng & VIP Kim Cương */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* CARD VIP VÀNG */}
              <div className="relative bg-white dark:bg-gray-900 border-2 border-[#EAB308] rounded-[32px] p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-400 via-[#EAB308] to-amber-500" />

                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                        <i className="fa-solid fa-star text-[#EAB308]" />
                        {VIP_PLANS.gold.tagText}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-3">
                        {VIP_PLANS.gold.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                        {VIP_PLANS.gold.subtitle}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#EAB308] flex items-center justify-center text-2xl shrink-0">
                      <i className="fa-solid fa-crown" />
                    </div>
                  </div>

                  {/* Giá tiền */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                        59.000 VNĐ
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        / tháng
                      </span>
                    </div>
                  </div>

                  {/* Danh sách quyền lợi */}
                  <ul className="space-y-3.5 text-sm text-gray-700 dark:text-gray-300">
                    {VIP_PLANS.gold.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <i className="fa-solid fa-circle-check text-[#EAB308] text-base mt-0.5 shrink-0" />
                        <span className="font-semibold">{feat}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-3 text-gray-400 line-through">
                      <i className="fa-solid fa-circle-xmark text-gray-300 text-base mt-0.5 shrink-0" />
                      <span>Đăng bài ẩn danh</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan("gold")}
                  className="mt-8 w-full h-14 rounded-2xl bg-gradient-to-r from-[#EAB308] to-amber-500 hover:opacity-95 text-black font-black text-base shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-bolt" />
                  <span>Nâng cấp ngay</span>
                </button>
              </div>

              {/* CARD VIP KIM CƯƠNG (BEST VALUE) */}
              <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-cyan-400 rounded-[32px] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500" />

                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-500 text-white shadow-sm">
                        <i className="fa-solid fa-gem" />
                        {VIP_PLANS.diamond.tagText}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                        {VIP_PLANS.diamond.name}
                      </h2>
                      <p className="text-xs text-cyan-200/80 font-semibold mt-1">
                        {VIP_PLANS.diamond.subtitle}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-2xl shrink-0">
                      <i className="fa-solid fa-gem" />
                    </div>
                  </div>

                  {/* Giá tiền */}
                  <div className="p-4 rounded-2xl bg-white/10 border border-cyan-400/30">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-cyan-300">
                        199.000 VNĐ
                      </span>
                      <span className="text-xs font-bold text-gray-300 uppercase">
                        / tháng
                      </span>
                    </div>
                  </div>

                  {/* Danh sách quyền lợi */}
                  <ul className="space-y-3.5 text-sm text-gray-100">
                    {VIP_PLANS.diamond.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <i className="fa-solid fa-circle-check text-cyan-400 text-base mt-0.5 shrink-0" />
                        <span className="font-semibold">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan("diamond")}
                  className="mt-8 w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:opacity-95 text-white font-black text-base shadow-lg shadow-cyan-500/25 transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-gem" />
                  <span>Nâng cấp ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MÀN HÌNH 2: TRANG THANH TOÁN & XÁC NHẬN (CHECKOUT UI)
            (Chỉ làm UI tĩnh, không gọi API / không đếm ngược chờ tiền)
        ========================================================= */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Xác Nhận Thanh Toán
                </h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Giao diện mẫu (Mock UI) xác nhận đơn hàng & phương thức thanh
                  toán dành cho Dev.
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setStep(userTier === "gold" ? 3 : 1)}
                className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-arrow-left" />
                <span>Quay lại</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cột trái: Đổi gói nhanh & Chọn phương thức thanh toán (UI) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Chọn gói nâng cấp */}
                <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                  <h3 className="font-black text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-black">
                      1
                    </span>
                    <span>Gói VIP đã chọn</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(["gold", "diamond"] as const)
                      .filter((pkgKey) =>
                        userTier === "gold" ? pkgKey === "diamond" : true
                      )
                      .map((pkgKey) => {
                        const pkg = VIP_PLANS[pkgKey];
                        const active = selectedPlanId === pkgKey;
                        return (
                          <div
                            key={pkgKey}
                            onClick={() =>
                              !isLoading && setSelectedPlanId(pkgKey)
                            }
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                              userTier === "gold" ? "sm:col-span-2" : ""
                            } ${
                              active
                                ? pkgKey === "gold"
                                  ? "border-[#EAB308] bg-amber-50/50 dark:bg-amber-950/20"
                                  : "border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20"
                                : "border-gray-100 dark:border-gray-800 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-black text-base ${
                                  pkgKey === "gold"
                                    ? "text-amber-600"
                                    : "text-cyan-600"
                                }`}
                              >
                                {userTier === "gold" && pkgKey === "diamond"
                                  ? "Nâng cấp: VIP Vàng → VIP Kim Cương"
                                  : pkg.name}
                              </span>
                              {active && (
                                <i className="fa-solid fa-circle-check text-emerald-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-semibold mt-1">
                              {userTier === "gold" && pkgKey === "diamond"
                                ? "Khấu trừ 59.000đ gói Vàng hiện tại, chỉ bù phần chênh lệch"
                                : `Thời hạn: ${pkg.duration}`}
                            </p>
                            <div className="text-2xl font-black mt-3 flex items-baseline gap-2">
                              <span>
                                {userTier === "gold" && pkgKey === "diamond"
                                  ? "+140.000 VNĐ"
                                  : pkg.priceText}
                              </span>
                              {userTier === "gold" && pkgKey === "diamond" && (
                                <span className="text-xs text-gray-400 line-through font-semibold">
                                  199.000đ
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 2. Chọn phương thức thanh toán giả lập (chỉ hiển thị UI) */}
                <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                  <h3 className="font-black text-base flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-black">
                      2
                    </span>
                    <span>Phương thức thanh toán (Giả lập UI)</span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        id: "qr" as PaymentMethodType,
                        title: "QR MoMo / VNPAY / VietQR",
                        sub: "Quét mã QR thanh toán tự động",
                        icon: "fa-solid fa-qrcode",
                        iconBg: "bg-blue-50 text-blue-600",
                      },
                      {
                        id: "momo" as PaymentMethodType,
                        title: "Ví điện tử MoMo",
                        sub: "Thanh toán nhanh qua ứng dụng MoMo",
                        icon: "fa-solid fa-wallet",
                        iconBg: "bg-pink-50 text-pink-600",
                      },
                      {
                        id: "card" as PaymentMethodType,
                        title: "Thẻ ngân hàng (ATM / Visa / Mastercard)",
                        sub: "Thẻ nội địa Napas hoặc thẻ quốc tế",
                        icon: "fa-solid fa-credit-card",
                        iconBg: "bg-indigo-50 text-indigo-600",
                      },
                    ].map((method) => {
                      const isSelected = paymentMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() =>
                            !isLoading && setPaymentMethod(method.id)
                          }
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-amber-400 bg-amber-50/30 dark:bg-amber-950/10"
                              : "border-gray-100 dark:border-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${method.iconBg}`}
                            >
                              <i className={method.icon} />
                            </div>
                            <div>
                              <h4 className="font-black text-sm">
                                {method.title}
                              </h4>
                              <p className="text-xs text-gray-400 font-semibold">
                                {method.sub}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-amber-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Khung minh họa tĩnh cho phương thức đang chọn */}
                  {paymentMethod === "card" && (
                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-dashed border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                      <div className="font-bold text-gray-500 uppercase">
                        Thông tin thẻ mẫu (UI Placeholder)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 font-mono font-bold">
                          4111 •••• •••• 8899
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 font-mono font-bold text-center">
                          12/28 • CVV ***
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Mã QR + Tóm tắt đơn hàng & Nút Xác nhận thanh toán */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-lg space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h3 className="text-lg font-black">
                      Quét mã để chuyển khoản
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        selectedPlanId === "gold"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                      }`}
                    >
                      {currentPlan.name}
                    </span>
                  </div>

                  {/* Hiển thị Mã QR rõ nét */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-48 h-48 bg-white border-2 border-gray-100 rounded-2xl p-3 shadow-inner flex items-center justify-center">
                      <img
                        src={`https://vietqr.app/img?acc=54551159888&bank=TPBank&amount=${checkoutPrice}&des=${encodeURIComponent(
                          isUpgradingFromGold
                            ? "TROVEVIP UPGRADE KC"
                            : selectedPlanId === "gold"
                            ? "TROVEVIP GOLD"
                            : "TROVEVIP DIAMOND"
                        )}&holder=${encodeURIComponent(
                          "TRAN QUANG TUAN ANH"
                        )}&template=qronly&showinfo=false`}
                        alt="QR Thanh toán"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Thông tin chuyển khoản */}
                    <div className="w-full space-y-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span>Ngân hàng:</span>
                        <strong className="text-black dark:text-white font-black">
                          TPBank
                        </strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span>Số tài khoản:</span>
                        <strong className="text-black dark:text-white font-black text-sm">
                          54551159888
                        </strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span>Chủ tài khoản:</span>
                        <strong className="text-black dark:text-white font-black">
                          TRAN QUANG TUAN ANH
                        </strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span>Thời hạn gói:</span>
                        <strong className="text-black dark:text-white font-black">
                          {currentPlan.duration} (30 ngày)
                        </strong>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span>Nội dung chuyển:</span>
                        <strong className="text-black dark:text-white font-black">
                          {isUpgradingFromGold
                            ? "TROVEVIP UPGRADE KC"
                            : selectedPlanId === "gold"
                            ? "TROVEVIP GOLD"
                            : "TROVEVIP DIAMOND"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Danh sách đặc quyền vắn tắt */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2.5">
                    <div className="text-xs font-black uppercase text-gray-400">
                      Đặc quyền bao gồm:
                    </div>
                    {currentPlan.features.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                      >
                        <i className="fa-solid fa-check text-emerald-500 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tổng thanh toán (hiển thị khấu trừ nếu nâng cấp từ Vàng lên Kim Cương) */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                    {isUpgradingFromGold && (
                      <div className="space-y-1 text-xs font-semibold text-gray-500">
                        <div className="flex justify-between">
                          <span>Giá gốc VIP Kim Cương:</span>
                          <span>199.000 VNĐ</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>Đã trừ gói VIP Vàng hiện tại:</span>
                          <span>-59.000 VNĐ</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-gray-500">
                        {isUpgradingFromGold ? "Số tiền bù thêm:" : "Tổng tiền:"}
                      </span>
                      <span className="text-3xl font-black text-red-500">
                        {checkoutPriceText}
                      </span>
                    </div>
                  </div>

                  {/* 2 Nút bấm theo yêu cầu: Xác nhận thanh toán & Quay lại */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleConfirmPayment}
                      className={`w-full h-14 rounded-2xl font-black text-base text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                        selectedPlanId === "gold"
                          ? "bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:opacity-95"
                          : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95"
                      } ${isLoading ? "opacity-75 cursor-wait" : ""}`}
                    >
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin" />
                          <span>Đang kích hoạt VIP...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-check" />
                          <span>
                            {isUpgradingFromGold
                              ? "Xác nhận nâng cấp (+140.000đ)"
                              : "Xác nhận thanh toán"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setStep(userTier === "gold" ? 3 : 1)}
                      className="w-full h-11 rounded-2xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MÀN HÌNH 3: TRANG QUẢN LÝ GÓI VIP ĐÃ ĐĂNG KÝ
            (VIP MANAGEMENT & ACTIVE STATUS)
        ========================================================= */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Header thông báo kích hoạt thành công */}
            <div
              className={`rounded-[28px] p-6 sm:p-8 border-2 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                userTier === "gold"
                  ? "bg-amber-50/90 border-[#EAB308] text-gray-900"
                  : "bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 border-cyan-400 text-gray-900"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md shrink-0 ${
                    userTier === "gold"
                      ? "bg-gradient-to-br from-[#EAB308] to-orange-500"
                      : "bg-gradient-to-br from-cyan-500 to-indigo-600"
                  }`}
                >
                  <i className="fa-solid fa-check" />
                </div>
                <div>
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                    Active Status
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black">
                    Kích hoạt thành công gói VIP {activeVipPlan.shortName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
                    Chào mừng bạn đến với không gian quản lý đặc quyền{" "}
                    {activeVipPlan.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Card thông tin thành viên (Member Card) */}
              <div className="lg:col-span-5">
                <div
                  className={`h-full rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden ${
                    userTier === "gold"
                      ? "bg-gradient-to-br from-amber-500 via-[#EAB308] to-orange-600"
                      : "bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-900 border-2 border-cyan-400"
                  }`}
                >
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest opacity-80">
                        MEMBER CARD
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-200 border border-emerald-300/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Đang hoạt động (Active)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-2xl font-black">
                        <i className="fa-solid fa-user-astronaut" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{displayUserName}</h3>
                        {/* Huy hiệu VIP tương ứng */}
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white text-gray-900 shadow-sm">
                          {userTier === "gold" ? (
                            <>
                              <i className="fa-solid fa-crown text-[#EAB308]" />
                              <span className="text-amber-700">
                                Huy hiệu Vàng
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-gem text-cyan-500 animate-pulse" />
                              <span className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                                Huy hiệu Kim Cương
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/20 flex items-center justify-between text-xs relative z-10">
                    <div>
                      <span className="opacity-75 block">
                        Ngày hết hạn (+30 ngày)
                      </span>
                      <strong className="text-sm font-black block mt-1">
                        {expiryDateStr}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="opacity-75 block">Gói đang dùng</span>
                      <strong className="text-sm font-black block mt-1">
                        {activeVipPlan.name}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard tóm tắt đặc quyền đã mở khóa */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-[32px] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Đặc quyền đã mở khóa
                </h2>

                {/* Thanh hạn mức AI Plan */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          userTier === "gold"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm">
                          Thanh hạn mức AI Plan
                        </h4>
                        <p className="text-xs text-gray-500">
                          Tạo lịch trình hẹn hò & khám phá thông minh
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3.5 py-1 rounded-full text-xs font-black ${
                        userTier === "gold"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                      }`}
                    >
                      {activeVipPlan.aiQuotaText}
                    </span>
                  </div>

                  {/* Thanh progress minh họa */}
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        userTier === "gold"
                          ? "w-1/3 bg-gradient-to-r from-yellow-400 to-[#EAB308]"
                          : "w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pill 1: Mở khóa địa điểm mới */}
                  <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">
                      <i className="fa-solid fa-location-dot" />
                      <span>Mở khóa địa điểm mới</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                      {activeVipPlan.placesBenefit}
                    </p>
                  </div>

                  {/* Pill 2: Đăng bài ẩn danh (Toggle nếu là Kim Cương) */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      userTier === "diamond"
                        ? "border-cyan-300 bg-cyan-50/30 dark:bg-cyan-950/20"
                        : "border-gray-200 bg-gray-50/60 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                          userTier === "diamond"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        <i className="fa-solid fa-user-secret" />
                        <span>Đăng bài ẩn danh</span>
                      </span>

                      {userTier === "diamond" ? (
                        <button
                          type="button"
                          onClick={() => setAnonymousToggle((prev) => !prev)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            anonymousToggle ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              anonymousToggle
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-400">
                          <i className="fa-solid fa-lock mr-1" />
                          Chỉ Kim Cương
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                      {userTier === "diamond"
                        ? anonymousToggle
                          ? "Chế độ ẩn danh đang BẬT khi đăng bài mới."
                          : "Chế độ ẩn danh đang TẮT."
                        : "Nâng cấp gói VIP Kim Cương để bật/tắt chế độ đăng bài ẩn danh."}
                    </p>
                  </div>
                </div>

                {/* Khung nâng cấp lên gói VIP Kim Cương (+140.000đ) khi đang ở gói Vàng */}
                {userTier === "gold" && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-cyan-950 text-white border border-cyan-400/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        <i className="fa-solid fa-gem" />
                        <span>Ưu đãi nâng cấp hạng</span>
                      </div>
                      <h4 className="font-black text-base text-white">
                        Nâng lên gói VIP Kim Cương
                      </h4>
                      <p className="text-xs text-cyan-100/80 font-medium">
                        Mở khóa AI Không giới hạn (∞) & Đăng bài ẩn danh — chỉ
                        bù thêm{" "}
                        <strong className="text-cyan-300 font-black">
                          140.000 VNĐ
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleUpgradeToDiamond}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-cyan-500/25 flex items-center gap-2 shrink-0 transition-transform hover:scale-[1.02]"
                    >
                      <i className="fa-solid fa-arrow-up-right-dots" />
                      <span>Nâng lên Kim Cương (+140.000đ)</span>
                    </button>
                  </div>
                )}

                {/* Footer Hỗ trợ */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    Hỗ trợ: <strong>{activeVipPlan.supportText}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
