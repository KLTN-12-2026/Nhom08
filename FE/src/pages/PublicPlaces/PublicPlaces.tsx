import React, { useState, useEffect } from "react";
import { Skeleton, Modal, Form, Input, Select, message, Rate, Button, Slider, Pagination } from "antd";
import usePublicPlacesStore, { Place } from "./PublicPlacesStore.ts";
import usePlacesStore from "../Places/PlacesStore.ts";
import useDomainStore from "../../stores/domainStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";
import StatusBadge from "./components/StatusBadge.tsx";
import PlaceDetailModal from "./components/PlaceDetailModal.tsx";
import PlaceFormModal from "../Places/components/PlaceFormModal.tsx";
import { activityGroups } from "../../data/remote/activityGroups";
import tagsAPI from "../../data/remote/tags";
import categoriesAPI from "../../data/remote/categories";

const { TextArea } = Input;
const { Option } = Select;

// Mobile-style PlaceCard
const PlaceCard = ({ place, onOpenDetail }: { place: Place; onOpenDetail: (place: Place) => void }) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex gap-4"
      onClick={() => onOpenDetail(place)}
    >
      {/* Left Image */}
      <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-100 relative">
        {place.image ? (
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
            <i className="fa-solid fa-location-dot text-white text-3xl opacity-40" />
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          {/* Title & Distance */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-black text-black dark:text-white leading-tight truncate">
              {place.name}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold shrink-0">
              8889.7km
            </span>
          </div>

          {/* Rating & Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[#FFCB37] text-xs font-black">
              ★ {place.rating ? place.rating.toFixed(1) : "5.0"}
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-600">
              {place.category || "Đồ ăn"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Thoáng
            </span>
          </div>

          {/* Address */}
          <p className="text-xs text-gray-500 truncate leading-relaxed">
            {place.address}
          </p>
        </div>

        {/* Bottom hot indicator */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-red-500 text-xs font-black bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
            <i className="fa-solid fa-fire text-[10px]" />
            <span>2</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400">8889.7KM</span>
        </div>
      </div>
    </div>
  );
};

export default function PublicPlaces() {
  const { t } = useLanguageStore();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [showBanner, setShowBanner] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [createTripForm] = Form.useForm();
  const { isSaving } = usePlacesStore();
  const { currentDomain, initializeDomain } = useDomainStore();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");

  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [filterDistance, setFilterDistance] = useState(100);
  const [filterActivity, setFilterActivity] = useState("Tất cả");

  // Options for detailed modal
  const [activityGroupOptions, setActivityGroupOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [tagOptions, setTagOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number; name: string }>>([]);

  const {
    places,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    total,
    currentPage,
    perPage,
    activityGroups: storeActivityGroups,
    isLoadingGroups,
    isCreateTripModalOpen,
    isPlaceModalOpen,
    selectedPlace,
    placeDetail,
    isLoadingPlaceDetail,
    fetchPlaces,
    fetchActivityGroups,
    handleLoadMore,
    handleCreateTrip,
    openPlaceDetail,
    closePlaceDetail,
    setCreateTripModalOpen,
    handleVersionClick,
  } = usePublicPlacesStore();

  // Find activity group ID by name
  const findActivityGroupId = (name: string) => {
    if (name === "Tất cả") return null;
    const group = storeActivityGroups.find(
      (g) => g.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(g.name.toLowerCase())
    );
    return group ? group.id : null;
  };

  // Local search filter
  const filteredPlaces = places.filter((place) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      place.name?.toLowerCase().includes(query) ||
      place.address?.toLowerCase().includes(query) ||
      place.description?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    initializeDomain();
    fetchActivityGroups();
  }, [initializeDomain, fetchActivityGroups]);

  // Fetch places when filters change
  useEffect(() => {
    const params: any = {};
    
    if (searchQuery) {
      params.search = searchQuery;
    }

    if (activeCategory !== "Tất cả") {
      const catId = findActivityGroupId(activeCategory);
      if (catId) {
        params.activity_group_ids = [catId];
      }
    }

    if (filterPriceRange !== "all") {
      if (filterPriceRange === "under200") {
        params.price_max = 200000;
      } else if (filterPriceRange === "200to500") {
        params.price_min = 200000;
        params.price_max = 500000;
      } else if (filterPriceRange === "over500") {
        params.price_min = 500000;
      }
    }

    if (filterDistance && filterDistance < 100) {
      params.distance_km = filterDistance;
      params.latitude = 16.0544;
      params.longitude = 108.2022;
    }

    fetchPlaces(1, false, params);
  }, [activeCategory, filterPriceRange, filterDistance, storeActivityGroups, searchQuery]);

  // Lazy load handlers for detailed modal
  const handleLoadActivityGroups = async (open: boolean) => {
    if (open && activityGroupOptions.length === 0) {
      try {
        const res = await activityGroups.getGroups();
        if (res.success && res.data && Array.isArray(res.data.data)) {
          setActivityGroupOptions(res.data.data.map((g: any) => ({ id: g.id, name: g.name })));
        } else if (Array.isArray(res)) {
          setActivityGroupOptions(res.map((g: any) => ({ id: g.id, name: g.name })));
        }
      } catch (e) {
        console.error("Failed to load activity groups", e);
      }
    }
  };

  const handleLoadTags = async (open: boolean) => {
    if (open && tagOptions.length === 0) {
      try {
        const res = await tagsAPI.getTags();
        if (res.success && res.data) {
          setTagOptions(res.data.data.map((t: any) => ({ id: t.id, name: t.name })));
        }
      } catch (e) {
        console.error("Failed to load tags", e);
      }
    }
  };

  const handleLoadCategories = async (open: boolean) => {
    if (open && categoryOptions.length === 0) {
      try {
        const catsRes = await categoriesAPI.getCategories();
        if (catsRes.success && catsRes.data) {
          setCategoryOptions(catsRes.data.data.map((c: any) => ({ id: c.id, name: c.display_name })));
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setFilterActivity(cat);
  };

  const handleApplyFilters = () => {
    setActiveCategory(filterActivity);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilterPriceRange("all");
    setFilterDistance(100);
    setFilterActivity("Tất cả");
    setActiveCategory("Tất cả");
    setIsFilterModalOpen(false);
  };

  const handleRandomFill = () => {
    const randomData = {
      name: "Địa điểm ngẫu nhiên " + Math.floor(Math.random() * 1000),
      address: "Đà Nẵng, Việt Nam",
      latitude: 16.0544,
      longitude: 108.2022,
      description: "Không gian lãng mạn và mát mẻ phù hợp cho hẹn hò.",
      average_price: 150000,
      contact_phone: "0905123456",
      contact_email: "contact@randomplace.com",
    };
    createTripForm.setFieldsValue(randomData);
  };

  const handleSave = async () => {
    try {
      const values = await createTripForm.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === "images") return;
        const value = values[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      if (values.images && values.images.fileList) {
        values.images.fileList.forEach((file: any, index: number) => {
          if (file.originFileObj) {
            formData.append(`images[${index}]`, file.originFileObj);
          }
        });
      }

      await handleCreateTrip(formData);
      createTripForm.resetFields();
    } catch (err) {
      console.error("Failed to save place:", err);
    }
  };

  const handleOpenCreateTrip = () => {
    setCreateTripModalOpen(true);
  };

  const handleCloseCreateTrip = () => {
    setCreateTripModalOpen(false);
    createTripForm.resetFields();
  };

  const onFinishCreateTrip = async () => {
    try {
      const values = await createTripForm.validateFields();
      await handleCreatePlan(values);
      createTripForm.resetFields();
    } catch (err) {
      console.error("Error validating form:", err);
    }
  };

  const handleCreatePlan = async (values: any) => {
    await handleCreateTrip(values);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-4 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 relative min-h-[calc(100vh-100px)] animate-fade-in">
      
      {/* 1. TOP MOBILE SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search bar wrapper stretches to fill space up to categories */}
        <div className="flex-1 flex items-center gap-3">
          <Input
            placeholder={t("publicPlaces.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<i className="fa-solid fa-magnifying-glass text-gray-400 mr-1" />}
            className="rounded-2xl py-3 border-none bg-white dark:bg-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.02)] w-full"
          />
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="w-12 h-12 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 shrink-0"
          >
            <i className="fa-solid fa-sliders text-lg text-black dark:text-gray-300" />
          </button>
        </div>

        {/* 2. CATEGORY PILLS HORIZONTAL LIST */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          <div className="flex items-center gap-2">
            {[
              { key: "Tất cả", label: t("publicPlaces.all") },
              { key: "Đồ ăn", label: t("customerHome.catFood") },
              { key: "Đồ uống", label: t("customerHome.catDrink") },
              { key: "Hẹn hò", label: t("customerHome.catDate") }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 shrink-0 ${
                  activeCategory === cat.key
                    ? "bg-[#FFCB37] text-black shadow-sm"
                    : "bg-white dark:bg-gray-900 text-black/80 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={handleOpenCreateTrip}
              className="px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-md flex items-center gap-1.5 ml-2"
            >
              <i className="fa-solid fa-plus text-xs" />
              {t("publicPlaces.addPlace")}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SẮP RA MẮT ANNOUNCEMENT BANNER */}
      {showBanner && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-[24px] p-5 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-bullhorn text-lg text-gray-600 dark:text-gray-300 animate-bounce" />
            <div className="space-y-0.5">
              <span className="text-sm font-black text-black dark:text-white block">{t("publicPlaces.comingSoon")}</span>
              <span className="text-xs text-gray-500 font-semibold block">{t("publicPlaces.comingSoonDesc")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBanner(false)} className="w-8 h-8 rounded-full bg-white/50 hover:bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* 4. PLACES LIST */}
      <div className="space-y-6">

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-3xl p-4 flex gap-4 border border-gray-50 shadow-sm">
                <div className="w-28 h-28 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onOpenDetail={openPlaceDetail} />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && places.length > 0 && (
          <div className="flex justify-center pt-8">
            <Pagination
              current={currentPage}
              pageSize={perPage}
              total={total}
              onChange={(page) => {
                const params: any = {};
                if (activeCategory !== "Tất cả") {
                  const catId = findActivityGroupId(activeCategory);
                  if (catId) {
                    params.activity_group_ids = [catId];
                  }
                }
                if (filterPriceRange !== "all") {
                  if (filterPriceRange === "under200") {
                    params.price_max = 200000;
                  } else if (filterPriceRange === "200to500") {
                    params.price_min = 200000;
                    params.price_max = 500000;
                  } else if (filterPriceRange === "over500") {
                    params.price_min = 500000;
                  }
                }
                if (filterDistance && filterDistance < 100) {
                  params.distance_km = filterDistance;
                  params.latitude = 16.0544;
                  params.longitude = 108.2022;
                }
                fetchPlaces(page, false, params);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </div>
        )}
      </div>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        open={isPlaceModalOpen}
        onCancel={closePlaceDetail}
        isLoading={isLoadingPlaceDetail}
        selectedPlace={selectedPlace}
        placeDetail={placeDetail}
      />

      {/* Detailed Place Creator Modal */}
      <PlaceFormModal
        open={isCreateTripModalOpen}
        isEditMode={false}
        isDetailLoading={false}
        isSaving={isSaving}
        form={createTripForm}
        tagOptions={tagOptions}
        categoryOptions={categoryOptions}
        activityGroupOptions={activityGroupOptions}
        onClose={handleCloseCreateTrip}
        onSave={handleSave}
        onRandomFill={handleRandomFill}
        handleLoadTags={handleLoadTags}
        handleLoadCategories={handleLoadCategories}
        handleLoadActivityGroups={handleLoadActivityGroups}
      />

      {/* Filter Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between w-full pr-6">
            <span className="text-lg font-black text-black">{t("publicPlaces.chooseDest")}</span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              {t("publicPlaces.reset")}
            </button>
          </div>
        }
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        width={400}
        className="rounded-[32px] custom-filter-modal"
      >
        <div className="space-y-6 mt-4 font-sans">
          <div className="space-y-3">
            <label className="font-black text-sm flex items-center gap-2 text-black">
              <i className="fa-solid fa-wallet text-gray-500" /> {t("publicPlaces.walletStatus")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFilterPriceRange(filterPriceRange === "under200" ? "all" : "under200")}
                className={`py-3 px-2 text-xs font-bold border rounded-2xl text-center transition-all ${
                  filterPriceRange === "under200"
                    ? "border-[#FFCB37] bg-[#FFCB37]/10 text-black font-black"
                    : "border-gray-100 bg-gray-50 hover:bg-white text-gray-700"
                }`}
              >
                {t("publicPlaces.under200")}
              </button>
              <button
                type="button"
                onClick={() => setFilterPriceRange(filterPriceRange === "200to500" ? "all" : "200to500")}
                className={`py-3 px-2 text-xs font-bold border rounded-2xl text-center transition-all ${
                  filterPriceRange === "200to500"
                    ? "border-[#FFCB37] bg-[#FFCB37]/10 text-black font-black"
                    : "border-gray-100 bg-gray-50 hover:bg-white text-gray-700"
                }`}
              >
                {t("publicPlaces.midPrice")}
              </button>
              <button
                type="button"
                onClick={() => setFilterPriceRange(filterPriceRange === "over500" ? "all" : "over500")}
                className={`py-3 px-2 text-xs font-bold border rounded-2xl text-center transition-all ${
                  filterPriceRange === "over500"
                    ? "border-[#FFCB37] bg-[#FFCB37]/10 text-black font-black"
                    : "border-gray-100 bg-gray-50 hover:bg-white text-gray-700"
                }`}
              >
                {t("publicPlaces.over500")}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-black text-sm flex items-center gap-2 text-black">
                <i className="fa-solid fa-location-arrow text-gray-500" /> {t("publicPlaces.distance")}
              </label>
              <span className="text-xs text-gray-400 font-bold">
                {filterDistance === 100 ? t("publicPlaces.all") : `${filterDistance} km`}
              </span>
            </div>
            <Slider
              min={1}
              max={100}
              value={filterDistance}
              onChange={(val) => setFilterDistance(val)}
              tooltip={{ formatter: (v) => v === 100 ? t("publicPlaces.all") : `${v} km` }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-black text-sm flex items-center gap-2 text-black">
                <i className="fa-solid fa-users-rectangle text-gray-500" /> {t("publicPlaces.activities")}
              </label>
              <button onClick={() => setFilterActivity("Tất cả")} className="text-xs text-red-500 font-bold">{t("publicPlaces.deselect")}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "Tất cả", label: t("publicPlaces.all") },
                { key: "Đồ ăn", label: t("customerHome.catFood") },
                { key: "Đồ uống", label: t("customerHome.catDrink") },
                { key: "Hẹn hò", label: t("customerHome.catDate") },
                { key: "Check-in / Giải trí", label: "Check-in / Giải trí" }
              ].map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setFilterActivity(a.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterActivity === a.key ? "bg-[#FFCB37] text-black" : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-white"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleApplyFilters}
            className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-black py-3.5 h-auto rounded-2xl text-sm"
          >
            {t("publicPlaces.applyFilter")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
