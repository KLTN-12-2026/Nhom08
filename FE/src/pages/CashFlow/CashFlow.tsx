"use client";

import useLanguageStore from "../../stores/languageStore.ts";
import useThemeStore from "../../stores/themeStore.ts";

// ── Mock data ────────────────────────────────────────────────────────────────
const SUMMARY_CARDS = [
  {
    key: "total_revenue",
    labelVi: "Tổng doanh thu",
    labelEn: "Total Revenue",
    value: "₫ 1,248,500,000",
    change: "+12.4%",
    up: true,
    icon: "fa-arrow-trend-up",
    color: "#22c55e",
    bg: "from-green-500/15 to-emerald-400/5",
    border: "border-green-500/20",
  },
  {
    key: "total_expense",
    labelVi: "Tổng chi phí",
    labelEn: "Total Expenses",
    value: "₫ 389,200,000",
    change: "-3.1%",
    up: false,
    icon: "fa-arrow-trend-down",
    color: "#ef4444",
    bg: "from-red-500/15 to-rose-400/5",
    border: "border-red-500/20",
  },
  {
    key: "net_cashflow",
    labelVi: "Dòng tiền ròng",
    labelEn: "Net Cash Flow",
    value: "₫ 859,300,000",
    change: "+18.7%",
    up: true,
    icon: "fa-scale-balanced",
    color: "#FFCB37",
    bg: "from-yellow-400/15 to-amber-300/5",
    border: "border-yellow-400/20",
  },
  {
    key: "pending",
    labelVi: "Chờ xử lý",
    labelEn: "Pending",
    value: "₫ 52,800,000",
    change: "14 giao dịch",
    up: null,
    icon: "fa-clock",
    color: "#a78bfa",
    bg: "from-violet-500/15 to-purple-400/5",
    border: "border-violet-500/20",
  },
];

const MONTHLY_DATA = [
  { month: "T1", revenue: 85, expense: 32 },
  { month: "T2", revenue: 92, expense: 28 },
  { month: "T3", revenue: 78, expense: 35 },
  { month: "T4", revenue: 110, expense: 40 },
  { month: "T5", revenue: 130, expense: 38 },
  { month: "T6", revenue: 105, expense: 30 },
  { month: "T7", revenue: 145, expense: 45 },
  { month: "T8", revenue: 160, expense: 42 },
  { month: "T9", revenue: 138, expense: 36 },
  { month: "T10", revenue: 172, expense: 50 },
  { month: "T11", revenue: 158, expense: 44 },
  { month: "T12", revenue: 190, expense: 52 },
];

const MAX_BAR = 200;

const TRANSACTIONS = [
  { id: "TXN-001", desc: "Gói Premium - Nguyễn Văn A", type: "income", amount: "₫ 299,000", date: "14/07/2026", status: "success" },
  { id: "TXN-002", desc: "Gói Basic - Trần Thị B", type: "income", amount: "₫ 99,000", date: "14/07/2026", status: "success" },
  { id: "TXN-003", desc: "Phí máy chủ tháng 7", type: "expense", amount: "₫ 2,500,000", date: "13/07/2026", status: "success" },
  { id: "TXN-004", desc: "Gói Enterprise - Công ty XYZ", type: "income", amount: "₫ 1,200,000", date: "13/07/2026", status: "pending" },
  { id: "TXN-005", desc: "Gói Premium - Lê Văn C", type: "income", amount: "₫ 299,000", date: "12/07/2026", status: "success" },
  { id: "TXN-006", desc: "Chi phí marketing Q3", type: "expense", amount: "₫ 5,000,000", date: "12/07/2026", status: "success" },
  { id: "TXN-007", desc: "Gói Basic - Phạm Thị D", type: "income", amount: "₫ 99,000", date: "11/07/2026", status: "failed" },
  { id: "TXN-008", desc: "Dịch vụ CDN tháng 7", type: "expense", amount: "₫ 850,000", date: "11/07/2026", status: "success" },
];

const CATEGORY_DATA = [
  { label: "Gói Basic", value: 38, color: "#60a5fa" },
  { label: "Gói Premium", value: 42, color: "#FFCB37" },
  { label: "Gói Enterprise", value: 20, color: "#a78bfa" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function CashFlow() {
  const { t } = useLanguageStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const isVi = t("common.loading") === "Đang tải...";

  const monthLabels = isVi
    ? ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getTransactionDesc = (desc: string) => {
    if (isVi) return desc;
    switch (desc) {
      case "Gói Premium - Nguyễn Văn A":
        return "Premium Package - Nguyễn Văn A";
      case "Gói Basic - Trần Thị B":
        return "Basic Package - Trần Thị B";
      case "Phí máy chủ tháng 7":
        return "July Server Fee";
      case "Gói Enterprise - Công ty XYZ":
        return "Enterprise Package - XYZ Company";
      case "Gói Premium - Lê Văn C":
        return "Premium Package - Lê Văn C";
      case "Chi phí marketing Q3":
        return "Q3 Marketing Expenses";
      case "Gói Basic - Phạm Thị D":
        return "Basic Package - Phạm Thị D";
      case "Dịch vụ CDN tháng 7":
        return "July CDN Service";
      default:
        return desc;
    }
  };

  const getCategoryLabel = (label: string) => {
    if (isVi) return label;
    switch (label) {
      case "Gói Basic":
        return "Basic Package";
      case "Gói Premium":
        return "Premium Package";
      case "Gói Enterprise":
        return "Enterprise Package";
      default:
        return label;
    }
  };

  const statusBadge = (status: string) => {
    if (status === "success")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          {t("cashflow.success")}
        </span>
      );
    if (status === "pending")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/15 text-yellow-600 dark:text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
          {t("cashflow.pending")}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
        {t("cashflow.failed")}
      </span>
    );
  };

  const getCardLabel = (key: string, card: typeof SUMMARY_CARDS[0]) => {
    switch (key) {
      case "total_revenue":
        return t("cashflow.totalRevenue");
      case "total_expense":
        return t("cashflow.totalExpenses");
      case "net_cashflow":
        return t("cashflow.netCashFlow");
      case "pending":
        return t("cashflow.pending");
      default:
        return isVi ? card.labelVi : card.labelEn;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t("cashflow.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {t("cashflow.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {[t("cashflow.weekly"), t("cashflow.monthly"), t("cashflow.quarterly"), t("cashflow.yearly")].map((p, i) => (
            <button
              key={p}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                i === 1
                  ? "bg-[#FFCB37] border-[#FFCB37] text-black shadow"
                  : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-yellow-400 hover:text-yellow-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border p-5 bg-gradient-to-br ${card.bg} ${card.border} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.color + "22" }}
              >
                <i className={`fa-solid ${card.icon} text-base`} style={{ color: card.color }}></i>
              </div>
              {card.up !== null && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    card.up
                      ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                  }`}
                >
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {getCardLabel(card.key, card)}
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              {card.value}
            </p>
            {card.up === null && (
              <p className="text-xs text-violet-500 dark:text-violet-400 mt-1 font-medium">
                {t("cashflow.transactionsCount").replace("{count}", "14")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">{t("cashflow.revenueAndExpenses")}</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#FFCB37] inline-block"></span>
                <span className="text-gray-500 dark:text-gray-400">{t("cashflow.revenue")}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>
                <span className="text-gray-500 dark:text-gray-400">{t("cashflow.expense")}</span>
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2 h-44">
            {MONTHLY_DATA.map((d, index) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-36">
                  {/* Revenue bar */}
                  <div
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-[#FFCB37] to-[#FFE27A] transition-all duration-500 hover:opacity-80"
                    style={{ height: `${(d.revenue / MAX_BAR) * 100}%` }}
                  />
                  {/* Expense bar */}
                  <div
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-red-500 to-red-400 transition-all duration-500 hover:opacity-80"
                    style={{ height: `${(d.expense / MAX_BAR) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{monthLabels[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut / category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
          <h2 className="font-bold text-gray-900 dark:text-white text-base mb-6">{t("cashflow.packageAllocation")}</h2>

          {/* SVG Donut */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 120 120" className="w-36 h-36">
              {(() => {
                let offset = 0;
                const r = 44;
                const circumference = 2 * Math.PI * r;
                return CATEGORY_DATA.map((seg) => {
                  const dash = (seg.value / 100) * circumference;
                  const gap = circumference - dash;
                  const el = (
                    <circle
                      key={seg.label}
                      cx="60" cy="60" r={r}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                      style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                  );
                  offset += dash;
                  return el;
                });
              })()}
              <text x="60" y="55" textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize="13" fontWeight="800">100%</text>
              <text x="60" y="70" textAnchor="middle" fill="#9ca3af" fontSize="7">{t("cashflow.totalPackages")}</text>
            </svg>
          </div>

          <div className="space-y-3 mt-auto">
            {CATEGORY_DATA.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{getCategoryLabel(seg.label)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${seg.value}%`, backgroundColor: seg.color }}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-8 text-right">{seg.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white text-base">{t("cashflow.recentTransactions")}</h2>
          <button className="text-xs font-semibold text-[#FFCB37] hover:underline flex items-center gap-1">
            {t("cashflow.viewAll")} <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.txnId")}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.description")}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.type")}</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.date")}</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.amount")}</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cashflow.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{tx.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{getTransactionDesc(tx.desc)}</td>
                  <td className="px-6 py-4">
                    {tx.type === "income" ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs">
                        <i className="fa-solid fa-arrow-up text-[10px]"></i> {t("cashflow.income")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-medium text-xs">
                        <i className="fa-solid fa-arrow-down text-[10px]"></i> {t("cashflow.expenseLabel")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{tx.date}</td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                    {tx.type === "expense" ? "–" : "+"}{tx.amount}
                  </td>
                  <td className="px-6 py-4 text-center">{statusBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
