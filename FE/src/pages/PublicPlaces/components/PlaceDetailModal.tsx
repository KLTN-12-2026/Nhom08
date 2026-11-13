import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Skeleton, Image, Rate, Input, Button, message } from "antd";
import { Place } from "../PublicPlacesStore";
import StatusBadge from "./StatusBadge.tsx";
import { RepositoryManager } from "../../../data/repositoryManager";
import useLanguageStore from "../../../stores/languageStore.ts";

interface PlaceDetailModalProps {
    open: boolean;
    onCancel: () => void;
    isLoading: boolean;
    selectedPlace: Place | null;
    placeDetail: any;
}

const cinemaMovies = [
  {
    id: 1,
    title: "Người Nhện 4: Khởi Đầu Mới",
    image: "/images/movies/spiderman.png",
    rating: "100%",
    genres: ["Hành động", "Phiêu lưu"],
  },
  {
    id: 2,
    title: "Conan Movie 29: Thiên Thần Sa Ngã Trên Xa Lộ",
    image: "/images/movies/conan.png",
    rating: "93%",
    genres: ["Hành động", "Gia đình"],
  },
  {
    id: 3,
    title: "The Odyssey",
    image: "/images/movies/odyssey.png",
    rating: "98%",
    genres: ["Hành động", "Thần thoại"],
  },
  {
    id: 4,
    title: "Minions & Quái Vật",
    image: "/images/movies/minions.png",
    rating: "85%",
    genres: ["Hoạt hình", "Hài hước"],
  },
];

// ── Auto-height image slider (no Ant Design Carousel — avoids blank space bug) ──
const ImageSlider = ({ mediaList, altText }: { mediaList: { url: string }[]; altText: string }) => {
    const [idx, setIdx] = useState(0);
    if (mediaList.length === 0) return null;
    return (
        <div className="w-full rounded-2xl overflow-hidden relative" style={{ lineHeight: 0 }}>
            <img
                key={idx}
                src={mediaList[idx].url}
                alt={altText}
                style={{ width: "100%", height: "auto", display: "block" }}
            />
            {mediaList.length > 1 && (
                <>
                    <button
                        onClick={() => setIdx((i) => (i - 1 + mediaList.length) % mediaList.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all"
                    >
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                    </button>
                    <button
                        onClick={() => setIdx((i) => (i + 1) % mediaList.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all"
                    >
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                    </button>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {mediaList.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`h-2 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/50 w-2"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
    open,
    onCancel,
    isLoading,
    selectedPlace,
    placeDetail,
}) => {
    const navigate = useNavigate();
    const { t } = useLanguageStore();

    const isCinema = 
        selectedPlace?.category === "Phim" || 
        placeDetail?.category === "Phim" ||
        selectedPlace?.name?.toLowerCase().includes("rạp") ||
        selectedPlace?.name?.toLowerCase().includes("cinema") ||
        selectedPlace?.name?.toLowerCase().includes("cgv") ||
        selectedPlace?.name?.toLowerCase().includes("starlight") ||
        placeDetail?.activity_groups?.some((g: any) => g.name === "Phim");

    // Favorite state
    const [isFavorited, setIsFavorited] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    // Comment states
    const [commentText, setCommentText] = useState("");
    const [ratingVal, setRatingVal] = useState(5);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [localReviews, setLocalReviews] = useState<any[]>([]);

    useEffect(() => {
        setIsFavorited(placeDetail?.is_favorited || selectedPlace?.is_favorited || false);
        if (placeDetail?.reviews) {
            setLocalReviews(placeDetail.reviews);
        } else {
            setLocalReviews([]);
        }
    }, [placeDetail?.id, selectedPlace?.id, open]);

    const handleToggleFavorite = async () => {
        if (!selectedPlace) return;
        setIsTogglingFavorite(true);
        try {
            const res = await RepositoryManager.places.toggleFavorite(selectedPlace.id);
            if (res.success) {
                const newFavStatus = res.data?.is_favorited !== undefined ? res.data.is_favorited : !isFavorited;
                setIsFavorited(newFavStatus);
                message.success(newFavStatus ? t("publicPlaces.saveSuccess") : t("publicPlaces.unsaveSuccess"));
            }
        } catch (e) {
            message.error("Không thể thực hiện hành động.");
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedPlace) return;
        if (!commentText.trim()) {
            message.error(t("publicPlaces.reviewError"));
            return;
        }
        setIsSubmittingReview(true);
        try {
            const res = await RepositoryManager.places.createReview({
                place_id: selectedPlace.id,
                rating: ratingVal,
                comment: commentText,
            });
            if (res.success || res.data) {
                message.success(t("publicPlaces.reviewSuccess"));
                const newReview = res.data || res;
                setLocalReviews((prev) => [newReview, ...prev]);
                setCommentText("");
                setRatingVal(5);
            }
        } catch (e) {
            message.error("Gửi đánh giá thất bại.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
            className="public-places-modal animate-fade-in"
            title={
                <div className="flex items-center justify-between w-full pr-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-secondary-900">{selectedPlace?.name}</div>
                            {selectedPlace && <StatusBadge status={selectedPlace.status} />}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedPlace && (
                            <button
                                onClick={() => {
                                    onCancel();
                                    navigate(`/places/${selectedPlace.id}`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all shadow-sm"
                                title="Xem trang chi tiết đầy đủ"
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                                <span>Chi tiết</span>
                            </button>
                        )}
                        <button
                            onClick={handleToggleFavorite}
                            disabled={isTogglingFavorite}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                isFavorited
                                    ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 dark:text-gray-400"
                            }`}
                        >
                            <i className={`fa-solid fa-heart ${isFavorited ? "text-red-500 animate-pulse" : "text-gray-300"}`} />
                            <span>{t("publicPlaces.savePlace")}</span>
                        </button>
                    </div>
                </div>
            }
        >
            {isLoading ? (
                <div className="py-8">
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
            ) : selectedPlace ? (
                <div className="space-y-6">
                    {/* Image slider — auto height, no cropping */}
                    <ImageSlider
                        mediaList={
                            placeDetail?.media?.length
                                ? placeDetail.media
                                : selectedPlace.image
                                ? [{ url: selectedPlace.image }]
                                : []
                        }
                        altText={selectedPlace.name}
                    />

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-solid fa-location-dot text-amber-500 mt-1"></i>
                            <div className="flex-1">
                                <p className="text-secondary-700 font-medium">{placeDetail?.address || selectedPlace.address}</p>
                                {placeDetail?.latitude && placeDetail?.longitude && (
                                    <p className="text-xs text-secondary-500 mt-1">
                                        {placeDetail.latitude}, {placeDetail.longitude}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Owner Info */}
                        {placeDetail?.user && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Image
                                    src={placeDetail.user.avatar}
                                    alt={placeDetail.user.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    preview={false}
                                />
                                <div>
                                    <p className="text-xs text-secondary-500">{t("publicPlaces.postedBy")}</p>
                                    <p className="text-sm font-semibold text-secondary-900">{placeDetail.user.name}</p>
                                </div>
                            </div>
                        )}

                        {placeDetail?.description && (
                            <div>
                                <h4 className="text-sm font-semibold text-secondary-900 mb-2">{t("publicPlaces.description")}</h4>
                                <p className="text-secondary-700 leading-relaxed">{placeDetail.description}</p>
                            </div>
                        )}

                        {/* Rating & Reviews */}
                        {(placeDetail?.rating || selectedPlace.rating) && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-star text-amber-500"></i>
                                    <span className="font-semibold text-secondary-900">
                                        {(placeDetail?.rating || selectedPlace.rating)?.toFixed(1)}
                                    </span>
                                </div>
                                {placeDetail?.reviews_count !== undefined && (
                                    <span className="text-sm text-secondary-500">
                                        ({placeDetail.reviews_count} {t("publicPlaces.reviews")})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Category & Activity Groups */}
                        <div className="flex flex-wrap gap-2">
                            {placeDetail?.categories && placeDetail.categories.map((cat: any) => (
                                <span key={cat.id} className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                                    {cat.display_name}
                                </span>
                            ))}
                            {placeDetail?.category && !placeDetail?.categories && (
                                <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                                    {placeDetail.category}
                                </span>
                            )}
                            {placeDetail?.activity_groups && placeDetail.activity_groups.length > 0 && (
                                <>
                                    {placeDetail.activity_groups.map((g: any) => (
                                        <span
                                            key={g.id}
                                            className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Price */}
                        {placeDetail?.average_price && (
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-money-bill-wave text-amber-500"></i>
                                <span className="text-secondary-700">
                                    {t("publicPlaces.avgPrice")}: {placeDetail.average_price.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        )}

                        {/* Contact Info */}
                        {(placeDetail?.contact_phone || placeDetail?.contact_email) && (
                            <div className="pt-4 border-t border-secondary-100 dark:border-gray-800 space-y-2">
                                <h4 className="text-sm font-semibold text-secondary-900">{t("publicPlaces.contactInfo")}</h4>
                                {placeDetail.contact_phone && (
                                    <div className="flex items-center gap-2 text-secondary-700">
                                        <i className="fa-solid fa-phone text-amber-500"></i>
                                        <span>{placeDetail.contact_phone}</span>
                                    </div>
                                )}
                                {placeDetail.contact_email && (
                                    <div className="flex items-center gap-2 text-secondary-700">
                                        <i className="fa-solid fa-envelope text-amber-500"></i>
                                        <span>{placeDetail.contact_email}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cinema movies listing */}
                        {isCinema && (
                            <div className="pt-4 border-t border-secondary-100 dark:border-gray-800 space-y-3 text-left">
                                <h4 className="text-sm font-semibold text-secondary-900 flex items-center gap-1.5">
                                    🎬 Phim đang chiếu tại rạp
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {cinemaMovies.map((movie) => (
                                        <div
                                            key={movie.id}
                                            onClick={() => {
                                                onCancel();
                                                window.location.href = `/movies/${movie.id}`;
                                            }}
                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 cursor-pointer transition-all border border-gray-100/50 dark:border-gray-800/50"
                                        >
                                            <img
                                                src={movie.image}
                                                alt={movie.title}
                                                className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
                                                    {movie.title}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    {movie.genres.join(", ")}
                                                </p>
                                                <span className="text-[10px] text-[#FFCB37] font-bold">
                                                    ★ {movie.rating}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {placeDetail?.tags && placeDetail.tags.length > 0 && (
                            <div className="pt-4 border-t border-secondary-100 dark:border-gray-800">
                                <h4 className="text-sm font-semibold text-secondary-900 mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {placeDetail.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 rounded-lg bg-secondary-50 text-secondary-600 text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Write Comment Form */}
                        <div className="pt-4 border-t border-secondary-100 dark:border-gray-800 space-y-3">
                            <h4 className="text-sm font-semibold text-secondary-900">
                                {t("publicPlaces.writeComment")}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-secondary-500">{t("publicPlaces.yourRating")}:</span>
                                <Rate value={ratingVal} onChange={setRatingVal} className="text-sm" />
                            </div>
                            <Input.TextArea
                                rows={3}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={t("publicPlaces.commentPlaceholder")}
                                className="rounded-xl"
                            />
                            <Button
                                type="primary"
                                onClick={handleSubmitReview}
                                loading={isSubmittingReview}
                                className="bg-amber-400 hover:bg-amber-500 text-black border-none font-bold rounded-xl"
                            >
                                {t("publicPlaces.submitReview")}
                            </Button>
                        </div>

                        {/* Reviews */}
                        {localReviews && localReviews.length > 0 && (
                            <div className="pt-4 border-t border-secondary-100 dark:border-gray-800">
                                <h4 className="text-sm font-semibold text-secondary-900 mb-3">
                                    {t("publicPlaces.recentReviews")} ({localReviews.length})
                                </h4>
                                <div className="space-y-4">
                                    {localReviews.map((review: any) => (
                                        <div key={review.id} className="flex gap-3">
                                            <Image
                                                src={review.user?.avatar}
                                                alt={review.user?.name}
                                                width={32}
                                                height={32}
                                                className="rounded-full object-cover"
                                                preview={false}
                                                fallback="https://ui-avatars.com/api/?name=User"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-secondary-900">
                                                        {review.user?.name || "Người dùng ẩn danh"}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-semibold">{review.rating}</span>
                                                        <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-secondary-600 bg-gray-50 p-2 rounded-lg">
                                                        {review.comment}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-secondary-400 mt-1">
                                                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default PlaceDetailModal;
