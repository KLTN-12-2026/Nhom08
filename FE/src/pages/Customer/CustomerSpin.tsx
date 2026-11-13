import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, message, Checkbox } from "antd";
import { RepositoryManager } from "../../data/repositoryManager";
import useLanguageStore from "../../stores/languageStore.ts";

const COLORS = [
  "#FFCB37", "#FF9F1C", "#FFD460", "#F77F00",
  "#FFD000", "#FFB703", "#FFE885", "#FB8500"
];



export default function CustomerSpin() {
  const { t } = useLanguageStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Places and selectors
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Wheel angles
  const startAngleRef = useRef(0);
  const spinAngleStartRef = useRef(0);
  const spinTimeRef = useRef(0);
  const spinTimeTotalRef = useRef(0);

  // Load favorite places and history
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await RepositoryManager.places.getFavoritePlaces();
        if (res && res.success && res.data) {
          const list = res.data.data || res.data;
          const mappedPlaces = list.map((item: any) => ({
            id: item.place?.id || item.place_id,
            name: item.place?.name || "Địa điểm yêu thích",
            address: item.place?.address || "Việt Nam",
            rating: item.place?.rating || 5,
            image: item.place?.image || item.place?.image_url || null
          })).filter((p: any) => p.name);

          setPlaces(mappedPlaces);
          // By default, select all favorite places
          setSelectedPlaceIds(mappedPlaces.map((p: any) => p.id));
        }
      } catch (e) {
        console.error("Failed to load favorite places for spin", e);
      }
    };
    loadData();

    const savedHistory = localStorage.getItem("trove_spin_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  // Filter selected places
  const activePlaces = places.filter((p) => selectedPlaceIds.includes(p.id));

  // Determine segments
  const currentSegments = activePlaces.length >= 2
    ? activePlaces.map((p) => p.name)
    : [
        "Quán Ốc Ngon",
        "Rạp Chiếu Phim",
        "Cà Phê View Sông",
        "Buffet Tokbokki",
        "Công Viên Đi Dạo",
        "Trà Sữa Full Topping"
      ];

  const arc = Math.PI / (currentSegments.length / 2);

  // Redraw when segments or startAngle changes
  useEffect(() => {
    drawRouletteWheel();
  }, [currentSegments]);

  const getPlaceEmoji = (place: any) => {
    const name = (place?.name || "").toLowerCase();
    if (name.includes("ốc") || name.includes("hải sản")) return "🐚";
    if (name.includes("phim") || name.includes("cinema")) return "🎬";
    if (name.includes("cà phê") || name.includes("coffee") || name.includes("trà")) return "☕";
    if (name.includes("tokbokki") || name.includes("ăn") || name.includes("lẩu")) return "🍜";
    if (name.includes("steak") || name.includes("bò")) return "🥩";
    return "📍";
  };

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outsideRadius = 200;
    const textRadius = 140;
    const insideRadius = 50;

    ctx.clearRect(0, 0, 440, 440);

    // Outer rim (Orange Border)
    ctx.strokeStyle = "#FFB300";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(220, 220, outsideRadius - 4, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < currentSegments.length; i++) {
      const angle = startAngleRef.current + i * arc - Math.PI / 2; // start from top like mobile
      
      // Mobile colors: light (#FFC107) and dark (#FFB300)
      ctx.fillStyle = i % 2 === 0 ? "#FFC107" : "#FFB300";

      ctx.beginPath();
      ctx.arc(220, 220, outsideRadius - 8, angle, angle + arc, false);
      ctx.lineTo(220, 220);
      ctx.closePath();
      ctx.fill();

      // White thin border lines between segments
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label (emoji + title) horizontally without rotation (upright)
      ctx.save();
      const midAngle = angle + arc / 2;
      const tx = 220 + Math.cos(midAngle) * textRadius;
      const ty = 220 + Math.sin(midAngle) * textRadius;

      // Draw Emoji
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const placeObj = activePlaces[i] || { name: currentSegments[i] };
      const emoji = getPlaceEmoji(placeObj);
      ctx.fillText(emoji, tx, ty - 12);

      // Draw Title
      ctx.font = "bold 12px Outfit, sans-serif";
      ctx.fillStyle = "#111111";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const name = currentSegments[i];
      const truncatedName = name.length > 15 ? name.substring(0, 12) + "..." : name;
      ctx.fillText(truncatedName, tx, ty + 10);
      ctx.restore();
    }

    // Draw Arrow Pointer pointing downwards at the top
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.moveTo(220 - 15, 220 - outsideRadius - 12);
    ctx.lineTo(220 + 15, 220 - outsideRadius - 12);
    ctx.lineTo(220, 220 - outsideRadius + 18);
    ctx.closePath();
    ctx.fill();

    // Center Circle Button
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(220, 220, insideRadius - 6, 0, Math.PI * 2, false);
    ctx.fill();

    // Outer ring for center circle
    ctx.strokeStyle = "#FFCB37";
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const rotateWheel = () => {
    spinTimeRef.current += 30;
    if (spinTimeRef.current >= spinTimeTotalRef.current) {
      stopRotateWheel();
      return;
    }
    const spinAngle =
      spinAngleStartRef.current -
      easeOut(spinTimeRef.current, 0, spinAngleStartRef.current, spinTimeTotalRef.current);
    startAngleRef.current += (spinAngle * Math.PI) / 180;
    drawRouletteWheel();
    requestAnimationFrame(rotateWheel);
  };

  const stopRotateWheel = () => {
    setSpinning(false);
    const degrees = (startAngleRef.current * 180) / Math.PI + 90;
    const arcd = (arc * 180) / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd) % currentSegments.length;
    const wonPlaceName = currentSegments[index];

    // Find full place object
    const wonPlace = activePlaces.find((p) => p.name === wonPlaceName) || {
      id: Date.now(),
      name: wonPlaceName,
      address: "Địa điểm quay ngẫu nhiên",
      rating: 5,
      image: null
    };

    setResult(wonPlace);
    setShowModal(true);

    // Save to history
    const newHistoryItem = {
      id: Date.now(),
      place_id: wonPlace.id,
      name: wonPlace.name,
      address: wonPlace.address || wonPlace.location || "Đà Nẵng, Việt Nam",
      image: wonPlace.image || wonPlace.image_url,
      rating: wonPlace.rating || 5,
      timestamp: new Date().toLocaleTimeString("vi-VN"),
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("trove_spin_history", JSON.stringify(updatedHistory));
  };

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const spin = () => {
    if (spinning) return;
    if (currentSegments.length < 2) {
      message.error("Vui lòng chọn ít nhất 2 địa điểm để quay!");
      return;
    }
    setSpinning(true);
    setResult(null);
    spinAngleStartRef.current = Math.random() * 10 + 15;
    spinTimeRef.current = 0;
    spinTimeTotalRef.current = Math.random() * 2000 + 3000;
    rotateWheel();
  };

  const toggleSelectPlace = (id: number) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPlaceIds(places.map((p) => p.id));
  };

  const handleClearAllSelected = () => {
    setSelectedPlaceIds([]);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("trove_spin_history");
    message.success("Đã xóa lịch sử quay!");
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
      {/* Header title */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-black text-black dark:text-white uppercase tracking-tight">
          {t("publicPlaces.tagline").includes("CÃI") ? (
            <>
              MẤY NÍ KHÔNG PHẢI <span className="text-[#FFCB37] dark:text-[#FFCB37]">"CÃI"</span> NHAU
            </>
          ) : (
            t("publicPlaces.tagline")
          )}
        </h1>
        <p className="text-gray-500 font-semibold text-sm">
          {t("publicPlaces.subtagline")}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ROW 1: The Spin Wheel Card (Centered and Large) */}
        <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-lg relative overflow-visible min-h-[580px] flex flex-col justify-between">
          <div className="text-center font-bold text-gray-600 dark:text-gray-300 text-sm z-10">
            {t("publicPlaces.spinWheel")}
          </div>

          {/* Wheel Canvas Container - Centered Vertically */}
          <div className="flex-1 flex items-center justify-center py-4 relative z-10">
            <div className="rounded-full overflow-hidden shadow-xl p-1 bg-white">
              <canvas ref={canvasRef} width={440} height={440} className="w-[440px] h-[440px]" />
            </div>
          </div>

          <div className="space-y-4 z-10">
            <Button
              type="primary"
              onClick={spin}
              loading={spinning}
              className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black py-4 rounded-2xl h-auto text-lg shadow-[0_8px_20px_rgba(255,203,55,0.3)] flex items-center justify-center gap-2"
            >
              {t("publicPlaces.spinNow")}
            </Button>
          </div>


        </div>

        {/* ROW 2: Place Selector & History Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COL 1: Place Selector List */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-lg h-[520px] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 shrink-0">
              <span className="font-black text-sm text-black dark:text-white">
                {t("publicPlaces.addPlaceToWheel")} ({selectedPlaceIds.length})
              </span>
              <div className="flex gap-2">
                <button onClick={handleSelectAll} className="text-xs text-blue-500 font-bold hover:underline">
                  {t("publicPlaces.selectAll")}
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={handleClearAllSelected} className="text-xs text-red-500 font-bold hover:underline">
                  {t("publicPlaces.clearAll")}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {places.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold text-sm">
                  {t("publicPlaces.loadingPlaces")}
                </div>
              ) : (
                places.map((place) => {
                  const isChecked = selectedPlaceIds.includes(place.id);
                  return (
                    <div
                      key={place.id}
                      onClick={() => toggleSelectPlace(place.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "border-[#FFCB37] bg-[#FFCB37]/5"
                          : "border-gray-50 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {place.image || place.image_url ? (
                          <img src={place.image || place.image_url} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-500 font-bold text-lg">
                            {place.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-black dark:text-white truncate">{place.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{place.address}</p>
                      </div>
                      <Checkbox checked={isChecked} className="pointer-events-none" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COL 2: Spin History */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-lg h-[520px] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 shrink-0">
              <span className="font-black text-sm text-black dark:text-white">
                {t("publicPlaces.spinHistory")} ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can text-[10px]" /> {t("publicPlaces.clearHistory")}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-semibold text-sm">
                  {t("publicPlaces.noHistory")}
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="flex gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-black dark:text-white truncate">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 truncate">{item.address}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <i
                            key={idx}
                            className={`fa-solid fa-star text-[8px] ${
                              idx < Math.round(item.rating) ? "text-[#FFCB37]" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-gift text-[#FFCB37] text-2xl" />
            <span className="text-lg font-black text-black">{t("publicPlaces.resultTitle")}</span>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={380}
        className="rounded-[32px] custom-result-modal"
      >
        {result && (
          <div className="text-center py-6 space-y-4">
            <p className="text-gray-500 font-semibold text-sm">{t("publicPlaces.resultSub")}</p>
            <div className="bg-[#FFCB37]/15 rounded-2xl p-5 border border-[#FFCB37]/20 space-y-3">
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-gray-100">
                {result.image || result.image_url ? (
                  <img src={result.image || result.image_url} alt={result.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-500 font-bold text-2xl">
                    {result.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-black">{result.name}</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">{result.address || result.location}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-semibold">{t("publicPlaces.resultBody")}</p>
            <Button
              onClick={() => setShowModal(false)}
              className="w-full bg-black text-white hover:bg-black/90 font-bold py-3 h-auto rounded-2xl border-none"
            >
              {t("publicPlaces.ok")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
