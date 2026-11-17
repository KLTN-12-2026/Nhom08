import React, { useState, useEffect } from "react";
import { Button, Tag, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLanguageStore from "../../stores/languageStore.ts";
import useDataMainStore from "../../stores/dataMainStore.js";
import placesAPI from "../../data/remote/places";

interface Post {
  id: number;
  title: string;
  category: string;
  status: "pending" | "published";
  date: string;
  image: string;
  description: string;
}

export default function CustomerPosts() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "published">("pending");
  const [loading, setLoading] = useState(false);

  // Get posts and actions from global store
  const { posts, deletePost, addPost } = useDataMainStore();

  // Load posts from backend API when component mounts
  useEffect(() => {
    const fetchUserPlaces = async () => {
      setLoading(true);
      try {
        const response = await placesAPI.getMyPlaces();
        if (response.success) {
          // Extract data properly if backend returns pagination
          const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          
          // Format API response to fit post structure and update store
          const apiPosts = rawData.map((item: any) => ({
            id: item.id,
            title: item.name,
            category: item.categories && item.categories.length > 0 
              ? item.categories[0].display_name || "Địa điểm"
              : "Địa điểm",
            // 1 is APPROVED in PlaceStatusEnum
            status: item.status === 1 ? "published" : "pending",
            date: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            image: (item.media && item.media.length > 0) 
              ? item.media[0].url 
              : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80",
            description: item.description || "Chưa có mô tả chi tiết."
          }));

          // Replace the posts with current API posts
          useDataMainStore.setState({ posts: apiPosts });
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết của tôi từ BE:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPlaces();
  }, []);

  const filteredPosts = posts.filter((post: Post) => post.status === activeTab);

  const handleDelete = async (id: number) => {
    try {
      // Soft-delete from Laravel backend
      await placesAPI.deletePublicPlace(id);
      deletePost(id);
      message.success("Xóa bài viết thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa bài viết:", err);
      message.error("Không thể xóa bài viết ở máy chủ.");
    }
  };

  const handleEdit = (id: number) => {
    message.info(`Đang chuyển hướng sang chỉnh sửa bài viết số #${id}...`);
    navigate(`/places/${id}/edit`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24 space-y-8">
      {/* Web Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display">
          {t("publicPlaces.myPostsTitle")}
        </h1>
        <p className="text-gray-500 font-semibold text-sm">
          {t("publicPlaces.myPostsSub")}
        </p>
      </div>

      {/* Tabs & Create CTA in single line for Web layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
        {/* Tab switcher buttons */}
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-4 font-black text-sm transition-all relative ${
              activeTab === "pending"
                ? "text-[#FFCB37]"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            {t("publicPlaces.pendingTab")}
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFCB37] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`pb-4 font-black text-sm transition-all relative ${
              activeTab === "published"
                ? "text-[#FFCB37]"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            {t("publicPlaces.publishedTab")}
            {activeTab === "published" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFCB37] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Quick Add CTA */}
        <button
          onClick={() => navigate("/places/create")}
          className="bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all duration-200"
        >
          <i className="fa-solid fa-plus mr-1.5" /> {t("publicPlaces.createPostBtn")}
        </button>
      </div>

      {/* Posts List Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post: Post) => (
            <Card
              key={post.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              bodyStyle={{ padding: 0 }}
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Location Image */}
                <div className="w-full sm:w-2/5 h-48 sm:h-auto relative shrink-0 bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <Tag className="absolute top-3 left-3 bg-black/75 border-none text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                    {post.category}
                  </Tag>
                </div>

                {/* Card Details */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-black dark:text-white line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold line-clamp-2">
                      {post.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Upload date and status */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-400 font-bold border-t border-gray-50 dark:border-gray-850 pt-3">
                      <span>
                        {t("publicPlaces.postDate")} <strong className="text-gray-600 dark:text-gray-300 font-extrabold">{post.date}</strong>
                      </span>
                      <span>
                        {t("publicPlaces.statusLabel")}{" "}
                        <strong className={post.status === "pending" ? "text-amber-500" : "text-green-500"}>
                          {post.status === "pending" ? t("publicPlaces.pendingTab") : t("publicPlaces.publishedTab")}
                        </strong>
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="flex-1 rounded-xl h-10 border border-gray-200 dark:border-gray-800 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all flex items-center justify-center gap-1"
                      >
                        <i className="fa-solid fa-pen-to-square" /> {t("publicPlaces.editBtn")}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="rounded-xl w-10 h-10 flex items-center justify-center border border-red-100 dark:border-red-950 bg-red-50/50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-all text-red-500"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State Banner Container styled beautifully for Web */
        <div className="bg-[#FFCB37]/10 dark:bg-[#FFCB37]/5 border-2 border-dashed border-[#FFCB37]/40 rounded-[32px] p-12 shadow-[0_15px_30px_rgba(255,203,55,0.04)] flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          {/* Info Circular Icon */}
          <div className="w-16 h-16 rounded-full bg-[#FFCB37] text-black flex items-center justify-center shadow-md animate-bounce">
            <i className="fa-solid fa-info text-2xl" />
          </div>

          {/* Text descriptions */}
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">
              {t("publicPlaces.noPostsTitle")}
            </h3>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("publicPlaces.noPostsDesc")}
            </p>
          </div>

          {/* Yellow Action Button */}
          <button
            onClick={() => navigate("/places/create")}
            className="w-full max-w-xs bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black font-black h-14 rounded-2xl text-base shadow-lg transition-transform duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-fire-flame-simple" /> {t("publicPlaces.createPostBtn")}
          </button>
        </div>
      )}
    </div>
  );
}
