import React, { useState, useEffect } from "react";
import { Card, Input, Rate, message, Spin, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import RepositoryManager from "../../data/repositoryManager";
import useLanguageStore from "../../stores/languageStore.ts";
import { transformPlace } from "../PublicPlaces/PublicPlacesStore.ts";

interface Place {
  id: number;
  name: string;
  address: string;
  description?: string;
  category?: string;
  rating: number;
  average_price?: number;
  media?: any[];
  categories?: any[];
  activity_groups?: any[];
  image?: string;
}

export default function CustomerFavorites() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [activityGroups, setActivityGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await RepositoryManager.places.getFavoritePlaces();
      let list = [];
      if (res) {
        const rawData = res.data?.data || res.data || (Array.isArray(res) ? res : []);
        list = rawData.map((fav: any) => {
          const rawPlace = fav.place || fav;
          if (!rawPlace) return null;
          
          const transformed = transformPlace(rawPlace);
          
          return {
            ...transformed,
            id: rawPlace.id || transformed.id,
            name: rawPlace.name || transformed.name || "Địa điểm không tên",
            address: rawPlace.address || transformed.address || "Chưa có địa chỉ",
            description: rawPlace.description || transformed.description || "",
            rating: rawPlace.average_rating || rawPlace.rating || transformed.rating || 5.0,
            image: rawPlace.image || transformed.image || (rawPlace.media && rawPlace.media[0]?.url) || "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80"
          };
        }).filter(Boolean);
      }
      setFavorites(list);
    } catch (e) {
      console.error("Failed to fetch favorites", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityGroups = async () => {
    try {
      const res = await RepositoryManager.activityGroups.getGroups();
      if (res && res.success && res.data && Array.isArray(res.data.data)) {
        setActivityGroups(res.data.data);
      } else if (res && Array.isArray(res)) {
        setActivityGroups(res);
      }
    } catch (e) {
      console.error("Failed to fetch activity groups", e);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchActivityGroups();
  }, []);

  const handleToggleFavorite = async (placeId: number) => {
    try {
      const res = await RepositoryManager.places.toggleFavorite(placeId);
      if (res && res.success) {
        message.success(t("publicPlaces.unsaveSuccess") || "Đã bỏ lưu địa điểm!");
        fetchFavorites();
      }
    } catch (e) {
      console.error(e);
      message.error("Có lỗi xảy ra!");
    }
  };

  // Filtering logic matching mobile features
  const filteredPlaces = favorites.filter((place) => {
    const matchesSearch = searchQuery.trim() === "" || 
                          place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (place.category && place.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === null) return matchesSearch;
    
    // Check if place belongs to selected activity group ID
    const hasGroup = (place.activity_groups || []).some(
      (group: any) => group.id === selectedCategory
    );
    return matchesSearch && hasGroup;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8 animate-fade-in">
      {/* Web Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display">
          {t("navigation.favorites")}
        </h1>
        <p className="text-gray-500 font-semibold text-sm">
          {t("publicPlaces.favoritesSub")}
        </p>
      </div>

      {/* Filter and Search Bar for Web Grid layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all border ${
              selectedCategory === null
                ? "bg-[#FFCB37] text-black border-transparent shadow-sm scale-102"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50"
            }`}
          >
            {t("favorites.catAll") || "Tất cả"}
          </button>
          {activityGroups.map((group) => {
            const isActive = selectedCategory === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedCategory(group.id)}
                className={`px-5 py-2 rounded-xl font-bold text-xs shrink-0 transition-all border ${
                  isActive
                    ? "bg-[#FFCB37] text-black border-transparent shadow-sm scale-102"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50"
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="w-full md:w-80 relative">
          <Input
            placeholder={t("publicPlaces.searchFavPlaceholder") || "Tìm kiếm địa điểm yêu thích..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 placeholder-gray-400 font-semibold text-xs focus:shadow-sm transition-all"
            suffix={<i className="fa-solid fa-magnifying-glass text-gray-400" />}
          />
        </div>
      </div>

      {/* Favorites List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" />
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-[32px] shadow-sm w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i className="fa-solid fa-heart-crack" />
          </div>
          <p className="text-gray-400 font-bold text-sm">
            {searchQuery ? "Không tìm thấy kết quả phù hợp" : t("publicPlaces.noFavFound")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, idx) => {
            const image = place.image || (place.media && place.media[0] 
              ? place.media[0].file_path || place.media[0].url 
              : "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80");

            return (
              <Card
                key={place.id}
                onClick={() => navigate(`/places/${place.id}`)}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer"
                style={{ animationDelay: `${idx * 50}ms` }}
                bodyStyle={{ padding: "20px" }}
              >
                {/* Card Top: Image Container */}
                <div className="h-48 w-full rounded-2xl overflow-hidden bg-gray-150 relative mb-4">
                  <img src={image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Floating Red Heart / Unsave Button with Confirmation Popconfirm */}
                  <Popconfirm
                    title="Xóa khỏi yêu thích"
                    description={`Bạn có chắc muốn xóa "${place.name}" khỏi danh sách yêu thích?`}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleToggleFavorite(place.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click navigation
                      }}
                      className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-red-500 hover:text-red-600 flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-90"
                    >
                      <i className="fa-solid fa-heart text-base" />
                    </button>
                  </Popconfirm>
                </div>

                {/* Card Bottom: Content info */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-black dark:text-white leading-tight truncate group-hover:text-[#FFCB37] transition-colors">
                    {place.name}
                  </h3>
                  
                  {/* Rating stars */}
                  <div className="flex">
                    <Rate disabled defaultValue={5} value={Math.round(place.rating || 5)} className="text-xs text-[#FFCB37] gap-0.5" style={{ color: "#FFCB37" }} />
                  </div>

                  {/* Address */}
                  <p className="text-[11px] text-gray-400 font-semibold truncate flex items-center gap-1">
                    <i className="fa-solid fa-location-dot text-red-500/80 text-xs shrink-0" />
                    {place.address}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
