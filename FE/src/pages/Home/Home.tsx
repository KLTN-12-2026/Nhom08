import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Rate, Avatar, Skeleton, Pagination } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";
import usePublicPlacesStore from "../PublicPlaces/PublicPlacesStore.ts";
import PlaceDetailModal from "../PublicPlaces/components/PlaceDetailModal.tsx";
import useDomainStore from "../../stores/domainStore.ts";
import RepositoryManager from "../../data/repositoryManager";

const heroImages = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1800&q=90",
];

export default function Home() {
  const { t } = useLanguageStore();
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Hero auto-slideshow: changes every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    { q: t("customerHome.faqQ1"), a: t("customerHome.faqA1") },
    { q: t("customerHome.faqQ2"), a: t("customerHome.faqA2") },
    { q: t("customerHome.faqQ3"), a: t("customerHome.faqA3") },
    { q: t("customerHome.faqQ4"), a: t("customerHome.faqA4") },
    { q: t("customerHome.faqQ5"), a: t("customerHome.faqA5") },
    { q: t("customerHome.faqQ6"), a: t("customerHome.faqA6") },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Tuấn & Thu Thảo",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      quote: t("customerHome.testimonial1"),
      rating: 5,
    },
    {
      name: "Lê Hoàng Long & Khánh Linh",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      quote: t("customerHome.testimonial2"),
      rating: 5,
    },
  ];

  const {
    places,
    isLoading,
    fetchPlaces,
    fetchActivityGroups,
    activityGroups: storeActivityGroups,
    isPlaceModalOpen,
    selectedPlace,
    placeDetail,
    isLoadingPlaceDetail,
    openPlaceDetail,
    closePlaceDetail,
    total,
    perPage,
  } = usePublicPlacesStore();

  const [featuredPlaces, setFeaturedPlaces] = useState<any[]>([]);

  const trendingSpots = [
    {
      name: "Lounge Rooftop Mây",
      address: "Tầng 25, Khách sạn Mường Thanh, Đà Nẵng",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      reviewCount: t("customerHome.reviews120"),
      tag: t("customerHome.tagMillionView"),
    },
    {
      name: "Cà Phê Sân Vườn An Nhiên",
      address: "45 Lê Lợi, Thạch Thang, Hải Châu, Đà Nẵng",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
      rating: 4.7,
      reviewCount: t("customerHome.reviews85"),
      tag: t("customerHome.tagHidden"),
    },
    {
      name: "Nhà hàng Steak House Bistro",
      address: "12 Bạch Đằng, Hải Châu, Đà Nẵng",
      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80",
      rating: 4.8,
      reviewCount: t("customerHome.reviews140"),
      tag: t("customerHome.tagRomantic"),
    },
  ];

  const { initializeDomain } = useDomainStore();

  useEffect(() => {
    initializeDomain();
    fetchActivityGroups();
    fetchPlaces(1, false, { per_page: 12 });
  }, [initializeDomain, fetchActivityGroups, fetchPlaces]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await RepositoryManager.places.getPublicPlaces({
          per_page: 3,
        });
        if (res && res.data && Array.isArray(res.data)) {
          setFeaturedPlaces(res.data);
        } else if (
          res &&
          res.data &&
          res.data.data &&
          Array.isArray(res.data.data)
        ) {
          setFeaturedPlaces(res.data.data);
        }
      } catch (e) {
        console.error("Failed to load featured places", e);
      }
    };
    fetchFeatured();
  }, []);

  const filteredPlaces = places;

  return (
    <div className="w-full space-y-20 pb-20 font-sans text-gray-900 dark:text-gray-100 relative">
      {/* 1. HERO SECTION — Full-bleed cinematic slideshow */}
      <section
        className="relative w-full overflow-hidden rounded-[32px] min-h-[580px] flex items-center"
        style={{
          backgroundImage: `url('${heroImages[heroSlide]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          transition: "background-image 0.8s ease-in-out",
        }}
      >
        {/* Full-cover dark overlay — left heavy for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.65) 45%, rgba(10,8,5,0.15) 75%, rgba(10,8,5,0.05) 100%)",
          }}
        />

        {/* Content grid */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 items-center min-h-[580px]">
          {/* ── LEFT: Text Content ── */}
          <div className="flex flex-col justify-center px-10 md:px-16 py-16 gap-7">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-400/40"
              style={{ background: "rgba(255,203,55,0.15)", color: "#FFCB37" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              {t("customerHome.heroBadge")}
            </div>

            {/* Headline — white on dark overlay = always clear */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg">
                {t("customerHome.title1")}
              </h1>
              <div
                className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08]"
                style={{
                  background:
                    "linear-gradient(135deg, #FFCB37 0%, #FF9F1C 50%, #FFD700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "block",
                  filter: "drop-shadow(0 2px 8px rgba(255,180,0,0.4))",
                }}
              >
                {t("customerHome.title2")}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed font-medium max-w-md">
              {t("customerHome.desc")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link to="/location">
                <button
                  className="flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-2xl text-black transition-all duration-200 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFCB37 0%, #FF9F1C 100%)",
                    boxShadow: "0 4px 20px rgba(255,203,55,0.45)",
                  }}
                >
                  <i className="fa-solid fa-compass" />
                  {t("customerHome.discoverBtn")}
                </button>
              </Link>
              <Link to="/plans">
                <button className="flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200">
                  <i className="fa-regular fa-calendar" />
                  {t("customerHome.planBtn")}
                </button>
              </Link>
            </div>

            {/* Mini stats row */}
            <div className="flex items-center gap-6 pt-2 border-t border-white/10">
              <div className="text-center">
                <div className="text-xl font-black text-white">5K+</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t("customerHome.statsPlaces")}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-black text-[#FFCB37]">12K+</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t("customerHome.statsDates")}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-black text-white">8K+</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t("customerHome.statsCouples")}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl font-black text-green-400">99.8%</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {t("customerHome.statsSatisfied")}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Floating badges only (image IS the background) ── */}
          <div className="relative hidden lg:flex items-center justify-end pr-10 min-h-[580px]">
            {/* Top badge */}
            <div className="absolute top-8 right-10 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-4 py-2.5 z-10 border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <i className="fa-solid fa-film text-red-500 text-sm" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black text-gray-900 dark:text-white">
                  {t("customerHome.heroMovieTitle")}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  {t("customerHome.heroMoviePrice")}
                </div>
              </div>
            </div>

            {/* Middle badge */}
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-4 py-2.5 z-10 border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <i className="fa-solid fa-mug-hot text-amber-500 text-sm" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black text-gray-900 dark:text-white">
                  {t("customerHome.heroCoffeeTitle")}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  {t("customerHome.heroCoffeePrice")}
                </div>
              </div>
            </div>

            {/* Bottom center badge */}
            <div className="absolute bottom-8 right-1/2 translate-x-1/2 flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-5 py-3 z-10 border border-gray-100 dark:border-gray-700 whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <i className="fa-solid fa-utensils text-green-500 text-sm" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black text-gray-900 dark:text-white">
                  {t("customerHome.heroDiningTitle")}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  {t("customerHome.heroDiningDesc")}
                </div>
              </div>
            </div>

            {/* Rating badge — top right corner */}
            <div className="absolute top-8 left-6 flex items-center gap-1.5 bg-amber-400 rounded-xl shadow-lg px-3 py-2 z-10">
              <i className="fa-solid fa-star text-black text-xs" />
              <span className="text-[11px] font-black text-black">
                4.9 / 5.0
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CENTRALIZED CONTAINER FOR OTHER SECTIONS */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 space-y-20">
        {/* 3. TRENDING SPOTS SECTION */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCB37]/15 text-[#E6B000] text-[10px] font-bold uppercase tracking-wider">
              {t("customerHome.trendingSub")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              {t("customerHome.trendingTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaces.length > 0
              ? featuredPlaces.map((item) => {
                  const images =
                    item.media?.map((m: any) => m.url) || item.images || [];
                  const mainImage =
                    images[0] ||
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80";
                  const category =
                    item.activity_groups?.[0]?.name || "Địa điểm";

                  return (
                    <Card
                      key={item.id}
                      onClick={() => {
                        const transformed: any = {
                          id: item.id,
                          name: item.name,
                          description: item.description || "Không có mô tả",
                          status:
                            item.status === 1
                              ? "open"
                              : item.status === 0
                                ? "coming"
                                : "closed",
                          category,
                          address: item.address || "Chưa có địa chỉ",
                          image: mainImage,
                          images,
                          rating: item.average_rating || item.rating || 5.0,
                          activity_groups: item.activity_groups,
                        };
                        openPlaceDetail(transformed);
                      }}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
                      bodyStyle={{ padding: 16 }}
                    >
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-50 dark:bg-gray-800 relative">
                        <img
                          src={mainImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-[#FFCB37] text-black font-bold text-[9px] uppercase px-2 py-0.5 rounded-lg shadow-sm">
                          {category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-base text-black dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.address}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {item.reviews_count || 0}{" "}
                            {t("publicPlaces.reviews") || "đánh giá"}
                          </span>
                          <span className="text-xs font-bold text-yellow-500">
                            ★{" "}
                            {(
                              item.average_rating ||
                              item.rating ||
                              5.0
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })
              : trendingSpots.map((item, idx) => (
                  <Card
                    key={idx}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    bodyStyle={{ padding: 16 }}
                  >
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-gray-50 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#FFCB37] text-black font-bold text-[9px] uppercase px-2 py-0.5 rounded-lg shadow-sm">
                        {item.tag}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-black dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.address}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {item.reviewCount}
                        </span>
                        <span className="text-xs font-bold text-yellow-500">
                          ★ {item.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
          </div>
        </section>

        {/* 4. EXPLORE ALL PLACES SECTION (Stretched 3-Column Layout) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCB37]/15 text-[#E6B000] text-[10px] font-bold uppercase tracking-wider">
              {t("customerHome.discoverSub")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              {t("customerHome.discoverTitle")}
            </h2>
          </div>

          {/* Places Grid - 3 Columns (Spaced evenly, no line wraps) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-4 flex flex-col gap-4 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <div className="w-full h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-150 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : filteredPlaces.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500 font-semibold">
                Không tìm thấy địa điểm nào phù hợp.
              </div>
            ) : (
              filteredPlaces.map((place) => (
                <Card
                  key={place.id}
                  onClick={() => openPlaceDetail(place)}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-left"
                  bodyStyle={{ padding: 16 }}
                >
                  <div className="w-full h-44 rounded-xl overflow-hidden mb-3 bg-gray-50 dark:bg-gray-800 relative">
                    {place.image ? (
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
                        <i className="fa-solid fa-location-dot text-white text-3xl opacity-40" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-950/90 flex items-center justify-center shadow-sm"
                    >
                      <i className="fa-solid fa-heart text-red-500 text-sm" />
                    </button>
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-base text-black dark:text-white truncate">
                        {place.name}
                      </h4>
                      <span className="text-xs font-bold text-yellow-500 shrink-0">
                        ★ {place.rating ? place.rating.toFixed(1) : "5.0"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {place.address}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {t("customerHome.avgCost")}
                      </span>
                      <span className="text-xs font-bold text-[#FF9F1C]">
                        {place.average_price
                          ? `${place.average_price.toLocaleString("vi-VN")} VNĐ`
                          : "Liên hệ"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* 5. MEMBERSHIP BANNER */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[24px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-left">
            <h3 className="text-2xl font-bold">
              {t("customerHome.vipBannerTitle")}
            </h3>
            <p className="text-white/90 text-sm max-w-xl text-justify">
              {t("customerHome.vipBannerDesc")}
            </p>
          </div>
          <Link to="/premium" className="shrink-0">
            <Button className="bg-white text-orange-600 border-none font-bold px-6 py-3 h-auto rounded-xl hover:scale-105 transition-transform">
              {t("customerHome.vipBannerBtn")}
            </Button>
          </Link>
        </section>

        {/* 6. TESTIMONIALS SECTION */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              {t("customerHome.testimonialsTitle")}
            </h2>
            <p className="text-gray-500 font-semibold text-xs md:text-sm">
              {t("customerHome.testimonialsSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-gray-900 border-none rounded-2xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={item.avatar}
                    size={44}
                    className="border border-gray-100 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-black dark:text-white leading-none">
                      {item.name}
                    </h4>
                    <Rate
                      disabled
                      defaultValue={item.rating}
                      className="text-[10px] text-[#FFCB37] mt-1"
                      style={{ color: "#FFCB37" }}
                    />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic font-medium leading-relaxed pt-1">
                  "{item.quote}"
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* 7. FAQS ACCORDION SECTION */}
        <section className="space-y-8 w-full">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCB37]/15 text-[#E6B000] text-[10px] font-bold uppercase tracking-wider">
              💬 Giải đáp thắc mắc
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
              {t("customerHome.faqTitle")}
            </h2>
            <p className="text-gray-500 font-semibold text-xs md:text-sm max-w-2xl mx-auto">
              {t("customerHome.faqSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Left Column (0, 1, 2) */}
            <div className="space-y-3">
              {faqs.slice(0, 3).map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    activeFaq === index
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-md"
                      : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left px-5 py-4 flex items-start gap-4 focus:outline-none"
                  >
                    {/* Number badge */}
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-xl text-[11px] font-black flex items-center justify-center mt-0.5 ${
                        activeFaq === index
                          ? "bg-amber-400 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-bold text-sm flex-1 leading-snug ${activeFaq === index ? "text-amber-700 dark:text-amber-400" : "text-black dark:text-white"}`}
                    >
                      {faq.q}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-${activeFaq === index ? "up" : "down"} text-gray-400 text-xs flex-shrink-0 mt-1`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="ml-11 border-t border-amber-100 dark:border-amber-900 pt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-[1.75] font-medium text-justify">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column (3, 4, 5) */}
            <div className="space-y-3">
              {faqs.slice(3, 6).map((faq, index) => {
                const actualIndex = index + 3;
                return (
                  <div
                    key={actualIndex}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      activeFaq === actualIndex
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-md"
                        : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(actualIndex)}
                      className="w-full text-left px-5 py-4 flex items-start gap-4 focus:outline-none"
                    >
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-xl text-[11px] font-black flex items-center justify-center mt-0.5 ${
                          activeFaq === actualIndex
                            ? "bg-amber-400 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        }`}
                      >
                        {actualIndex + 1}
                      </span>
                      <span
                        className={`font-bold text-sm flex-1 leading-snug ${activeFaq === actualIndex ? "text-amber-700 dark:text-amber-400" : "text-black dark:text-white"}`}
                      >
                        {faq.q}
                      </span>
                      <i
                        className={`fa-solid fa-chevron-${activeFaq === actualIndex ? "up" : "down"} text-gray-400 text-xs flex-shrink-0 mt-1`}
                      />
                    </button>
                    {activeFaq === actualIndex && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="ml-11 border-t border-amber-100 dark:border-amber-900 pt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-[1.75] font-medium text-justify">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      <PlaceDetailModal
        open={isPlaceModalOpen}
        onCancel={closePlaceDetail}
        isLoading={isLoadingPlaceDetail}
        selectedPlace={selectedPlace}
        placeDetail={placeDetail}
      />
    </div>
  );
}
