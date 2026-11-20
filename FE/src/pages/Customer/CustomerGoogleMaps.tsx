import React, { useState } from "react";
import { Input, Tag, Card } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";

interface PlaceResult {
  id: number;
  name: string;
  type: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceRange?: string;
  image?: string;
}

export default function CustomerGoogleMaps() {
  const { t } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("catCoffee");
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const categories = [
    { key: "catFood", icon: "fa-utensils" },
    { key: "catCoffee", icon: "fa-mug-hot" },
    { key: "catRestaurant", icon: "fa-champagne-glasses" },
    { key: "catHotel", icon: "fa-hotel" },
    { key: "catBar", icon: "fa-martini-glass-citrus" },
    { key: "catBoba", icon: "fa-glass-water" },
  ];

  // Demo data matching the mobile screenshots
  const [places] = useState<PlaceResult[]>([
    {
      id: 1,
      name: "Highlands Coffee",
      type: "Quán cà phê",
      address: "192A Đường số 4, An Hội Đông, Hồ Chí Minh 7...",
      rating: 4.9,
      reviewCount: 17,
      priceRange: "1-100.000 đ",
    },
    {
      id: 2,
      name: "XLIII Specialty Coffee",
      type: "Quán cà phê",
      address: "422 Ngô Thì Sĩ, Ngũ Hành Sơn, Đà Nẵng 5500...",
      rating: 4.7,
      reviewCount: 9601,
    },
    {
      id: 3,
      name: "CÀ PHÊ PHỐ (Coffee & Billiard Phố)",
      type: "Quán cà phê",
      address: "Huỳnh Văn Tiết/706 Long Thượng - Hưng Lon...",
      rating: 4.9,
      reviewCount: 27,
    },
    {
      id: 4,
      name: "The Coffee House",
      type: "Quán cà phê",
      address: "86 Lê Lợi, Hải Châu, Đà Nẵng",
      rating: 4.6,
      reviewCount: 3240,
    },
    {
      id: 5,
      name: "Phúc Long Coffee & Tea",
      type: "Quán cà phê",
      address: "32 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
      rating: 4.5,
      reviewCount: 1852,
      priceRange: "25-89.000 đ",
    },
    {
      id: 6,
      name: "43 Factory Coffee Roaster",
      type: "Quán cà phê",
      address: "Lot A2-1, Đường 30 Tháng 4, Hải Châu, Đà Nẵng",
      rating: 4.8,
      reviewCount: 4120,
    },
  ]);

  const filteredPlaces = places.filter(p =>
    searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-6">

      {/* Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">{t("googleMaps.pageTitle")}</h1>
      </div>

      {/* Advanced Search Collapsible */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-850 shadow-sm overflow-hidden">
        {/* Collapse Header */}
        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
        >
          <span>{t("googleMaps.advancedSearch")}</span>
          <i className={`fa-solid fa-chevron-${advancedOpen ? 'up' : 'down'} text-xs text-gray-400`} />
        </button>

        {advancedOpen && (
          <div className="px-6 pb-6 space-y-5">
            {/* Search Input */}
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("googleMaps.searchPlaceholder")}
              allowClear
              className="rounded-xl border-gray-200 dark:border-gray-700 h-12 text-sm font-semibold"
              prefix={<i className="fa-solid fa-magnifying-glass text-gray-400 mr-2" />}
            />

            {/* GPS Location indicator */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-850 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#FFF0C8] dark:bg-[#33290A] flex items-center justify-center shrink-0">
                <i className="fa-solid fa-location-crosshairs text-[#FFCB37] text-sm" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">
                3800 6th Florida Ave NW, Washington, Dist...
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                    selectedCategory === cat.key
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                  }`}
                >
                  {t(`googleMaps.${cat.key}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-bold text-sm">
            <i className="fa-solid fa-map-location-dot text-4xl mb-3 block opacity-30" />
            {t("googleMaps.noResults")}
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="flex items-start gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl hover:shadow-md hover:border-[#FFCB37]/30 transition-all duration-200 cursor-pointer group"
            >
              {/* Place Pin Icon */}
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-850 flex items-center justify-center shrink-0 group-hover:bg-[#FFF0C8] dark:group-hover:bg-[#33290A] transition-colors">
                <i className="fa-solid fa-location-dot text-[#FFCB37] text-lg" />
              </div>

              {/* Place Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-sm text-black dark:text-white leading-tight group-hover:text-[#E6B000] transition-colors truncate">
                  {place.name}
                </h3>
                <p className="text-[11px] font-semibold text-gray-400">{place.type}</p>
                <p className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 truncate">
                  <i className="fa-solid fa-location-dot text-[9px]" /> {place.address}
                </p>
                <div className="flex items-center gap-1 pt-0.5">
                  <span className="text-[#FFCB37] text-sm">★</span>
                  <span className="text-xs font-bold text-black dark:text-white">{place.rating}</span>
                  <span className="text-[11px] text-gray-400 font-semibold">({place.reviewCount.toLocaleString()})</span>
                </div>
              </div>

              {/* Price Range (if available) */}
              {place.priceRange && (
                <div className="shrink-0 self-center">
                  <span className="text-xs font-bold text-red-400">{place.priceRange}</span>
                </div>
              )}

              {/* Arrow */}
              <div className="shrink-0 self-center">
                <i className="fa-solid fa-location-dot text-lg text-[#FFCB37] opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
