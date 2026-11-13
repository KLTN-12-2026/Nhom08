import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Input, Rate, Avatar, message, Upload, Select, InputNumber, Tag, Image, Tooltip } from "antd";
import { activityGroups } from "../../data/remote/activityGroups";
import tagsAPI from "../../data/remote/tags";
import categoriesAPI from "../../data/remote/categories";
import useDataMainStore from "../../stores/dataMainStore.js";
import placesAPI from "../../data/remote/places";
import useLanguageStore from "../../stores/languageStore.ts";
import useCustomerStore from "../../stores/customerStore.js";

const { TextArea } = Input;
const { Option } = Select;

interface Review {
  id: number;
  userId?: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export default function CustomerPlaces() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { user: currentUser } = useCustomerStore();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  
  // Get addPost from global store
  const { addPost } = useDataMainStore();

  // Selector Options
  const [tagOptions, setTagOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [activityGroupOptions, setActivityGroupOptions] = useState<Array<{ id: number; name: string }>>([]);

  // Place data from API
  const [place, setPlace] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");

  // Load options for create form
  useEffect(() => {
    if (!id) {
      loadOptions();
    }
  }, [id]);

  // Load place details from API when id is present
  useEffect(() => {
    if (id) {
      fetchPlace();
    }
  }, [id]);

  const fetchPlace = async () => {
    setLoadingPlace(true);
    try {
      const res = await placesAPI.getPlaceById(id);
      const data = res?.data || res;
      setPlace(data);
      setIsFavorited(Boolean(data?.is_favorited));
      setActiveImageIdx(0);
      // Map reviews từ API response
      const rawReviews = data?.reviews || data?.data?.reviews || [];
      setReviews(
        rawReviews.map((r: any) => ({
          id: r.id,
          userId: r.user?.id || r.user_id,
          user: r.user?.name || r.user_name || "Người dùng",
          avatar: r.user?.avatar || r.avatar || "",
          rating: r.rating,
          comment: r.comment || r.content || "",
          date: r.created_at?.split("T")[0] || "",
        }))
      );
    } catch (e) {
      message.error("Không thể tải thông tin địa điểm.");
    } finally {
      setLoadingPlace(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id) return;
    setIsTogglingFavorite(true);
    try {
      const res = await placesAPI.toggleFavorite(Number(id));
      if (res?.success || res?.data !== undefined) {
        const nextState = res?.data?.is_favorited !== undefined ? res.data.is_favorited : !isFavorited;
        setIsFavorited(nextState);
        message.success(nextState ? "Đã lưu địa điểm vào danh sách yêu thích!" : "Đã bỏ lưu địa điểm.");
      } else {
        setIsFavorited(!isFavorited);
        message.success(!isFavorited ? "Đã lưu địa điểm!" : "Đã bỏ lưu địa điểm.");
      }
    } catch (e) {
      message.error("Vui lòng đăng nhập để lưu địa điểm yêu thích.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = async () => {
    try {
      const tagRes = await tagsAPI.getTags();
      const tagsList = tagRes?.data?.data || tagRes?.data || [];
      if (Array.isArray(tagsList)) {
        setTagOptions(tagsList.map((t: any) => ({ id: t.id, name: t.name || t.display_name })));
      }

      const catRes = await categoriesAPI.getCategories();
      const catList = catRes?.data?.data || catRes?.data || [];
      if (Array.isArray(catList)) {
        setCategoryOptions(catList.map((c: any) => ({ id: c.id, name: c.display_name || c.name })));
      }

      const groupRes = await activityGroups.getGroups();
      const groupList = groupRes?.data?.data || groupRes?.data || [];
      if (Array.isArray(groupList)) {
        setActivityGroupOptions(groupList.map((g: any) => ({ id: g.id, name: g.name })));
      }
    } catch (e) {
      console.error("Failed to load options", e);
    }
  };

  const handleAddReview = async (values: any) => {
    setIsSubmittingReview(true);
    try {
      const payload = {
        place_id: Number(id),
        rating: values.rating,
        comment: values.comment,
      };
      const res = await placesAPI.createReview(payload);
      if (res?.success || res?.data) {
        const reviewData = res.data?.data || res.data || {};
        const newReview: Review = {
          id: reviewData.id || Date.now(),
          userId: currentUser?.id,
          user: currentUser?.name || reviewData.user?.name || "Bạn",
          avatar: currentUser?.avatar || reviewData.user?.avatar || "",
          rating: Number(values.rating),
          comment: values.comment,
          date: new Date().toISOString().split("T")[0],
        };
        setReviews([newReview, ...reviews]);
        form.resetFields();
        message.success("Cảm ơn bạn đã bình luận đánh giá địa điểm!");
      } else {
        message.error(res?.message || "Gửi đánh giá thất bại.");
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        message.error("Vui lòng đăng nhập để bình luận đánh giá địa điểm!");
      } else {
        message.error(e?.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const res = await placesAPI.deleteReview(reviewId);
      if (res?.success !== false) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        message.success("Đã xóa bình luận!");
      } else {
        message.error(res?.message || "Không thể xóa bình luận.");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Lỗi khi xóa bình luận.");
    }
  };

  const handleCreatePlace = async (values: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all text/array values to FormData
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

      // Default fallback coordinates if missing
      if (!values.latitude) formData.append("latitude", "10.762622");
      if (!values.longitude) formData.append("longitude", "106.660172");

      // Handle image file uploads
      if (values.images && values.images.fileList) {
        values.images.fileList.forEach((file: any, index: number) => {
          if (file.originFileObj) {
            formData.append(`images[${index}]`, file.originFileObj);
          }
        });
      }

      // Call Laravel BE API (multipart/form-data)
      const result = await placesAPI.createPublicPlace(formData);
      
      if (result && (result.success !== false)) {
        message.success("Đăng địa điểm mới thành công! Địa điểm của bạn đã được gửi lên hệ thống.");
        createForm.resetFields();
        setTimeout(() => {
          navigate("/location");
        }, 800);
      } else {
        message.error(result?.message || "Đăng địa điểm thất bại");
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm địa điểm:", error);
      const errors = error?.response?.data?.errors;
      let errMsg = "";
      if (errors && typeof errors === "object") {
        errMsg = Object.values(errors).flat().join(" ");
      } else {
        errMsg = error?.response?.data?.message || "Có lỗi xảy ra khi kết nối tới máy chủ.";
      }
      message.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRandomFill = () => {
    const randomData = {
      name: "Nhà hàng RANDOM  " + Math.floor(Math.random() * 1000),
      address: "123 Đường ABC, Quận 1, TP.HCM",
      latitude: 10.762622,
      longitude: 106.660172,
      description: "Nhà hàng ngon tuyệt vời với không gian thoáng mát.",
      category_ids: categoryOptions.length > 0 ? [categoryOptions[0].id] : [],
      activity_group_ids: activityGroupOptions.length > 0 ? [activityGroupOptions[0].id] : [],
      average_price: 150000,
      contact_email: "contact@restaurant.com",
      contact_phone: "0123456789",
      tags: tagOptions.length > 0 ? [tagOptions[0].name] : [],
    };
    createForm.setFieldsValue(randomData);
  };

  // If ID is not defined, render full-featured Add Place Web Form
  if (!id) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
        <Card 
          title={
            <span className="flex items-center gap-2 text-lg font-semibold">
              <i className="fa-solid fa-location-dot text-black"></i>
              New Place
            </span>
          }
          className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-[32px] p-8 shadow-sm"
        >
          <Form form={createForm} layout="vertical" onFinish={handleCreatePlace} className="pt-4">
            
            {/* Image Upload */}
            <Form.Item label="Images" name="images">
              <Upload
                listType="picture-card"
                multiple
                maxCount={10}
                beforeUpload={() => false}
                accept="image/*"
              >
                <div className="flex flex-col items-center justify-center">
                  <i className="fa-solid fa-plus text-2xl text-gray-400 mb-2"></i>
                  <div className="text-sm text-gray-500">Upload</div>
                </div>
              </Upload>
              <div className="text-xs text-gray-500 mt-2">
                Maximum 10 images. Supported: JPG, PNG, GIF
              </div>
            </Form.Item>

            {/* Place Name */}
            <Form.Item
              name="name"
              label="Place Name"
              rules={[{ required: true, message: "Please enter place name" }]}
            >
              <Input placeholder="e.g., The Coffee House" />
            </Form.Item>

            {/* Address */}
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input placeholder="Full address" />
            </Form.Item>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="latitude" label="Latitude">
                <InputNumber className="w-full" placeholder="10.762622" step={0.000001} />
              </Form.Item>

              <Form.Item name="longitude" label="Longitude">
                <InputNumber className="w-full" placeholder="106.660172" step={0.000001} />
              </Form.Item>
            </div>

            {/* Description */}
            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Describe this place..." />
            </Form.Item>

            {/* Average Price & Contact Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="average_price" label="Average Price (VND)">
                <InputNumber className="w-full" min={0} placeholder="50000" />
              </Form.Item>

              <Form.Item name="contact_phone" label="Contact Phone">
                <Input placeholder="0123456789" />
              </Form.Item>
            </div>

            {/* Contact Email */}
            <Form.Item name="contact_email" label="Contact Email">
              <Input type="email" placeholder="contact@place.com" />
            </Form.Item>

            {/* Tags, Categories, Activity Groups */}
            <div className="grid grid-cols-3 gap-4">
              <Form.Item name="tags" label="Tags">
                <Select
                  mode="multiple"
                  placeholder="Select tags"
                  allowClear
                >
                  {tagOptions.map(tag => (
                    <Option key={tag.id} value={tag.name}>{tag.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category_ids"
                label="Categories"
                rules={[{ required: true, message: "Please select at least one category" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select categories"
                  allowClear
                >
                  {categoryOptions.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="activity_group_ids"
                label="Activity Groups"
              >
                <Select
                  mode="multiple"
                  placeholder="Select activity groups"
                  allowClear
                >
                  {activityGroupOptions.map(group => (
                    <Option key={group.id} value={group.id}>{group.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* Footer / Actions row */}
            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                onClick={handleRandomFill} 
                className="mr-auto" 
                icon={<i className="fa-solid fa-dice text-purple-500"></i>}
              >
                Random Fill
              </Button>
              <Button onClick={() => navigate("/location")}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Save
              </Button>
            </div>

          </Form>
        </Card>
      </div>
    );
  }

  // Else, render the Place details and reviews page (Detail Mode)
  if (loadingPlace) {
    return (
      <div className="max-w-5xl mx-auto w-full py-20 flex justify-center items-center">
        <div className="text-center space-y-4">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-[#FFCB37]" />
          <p className="text-gray-500 font-semibold text-base">Đang tải thông tin địa điểm...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-5xl mx-auto w-full py-20 text-center space-y-4">
        <i className="fa-regular fa-circle-question text-5xl text-gray-300"></i>
        <p className="text-gray-500 font-semibold text-lg">Không tìm thấy địa điểm này.</p>
        <Button onClick={() => navigate("/location")} type="primary" className="bg-[#FFCB37] text-black font-bold border-none rounded-xl">
          Quay lại danh sách địa điểm
        </Button>
      </div>
    );
  }

  // Danh sách hình ảnh
  const mediaList: string[] = [];
  if (Array.isArray(place.media) && place.media.length > 0) {
    place.media.forEach((m: any) => {
      const url = m?.original_url || m?.url;
      if (url) mediaList.push(url);
    });
  }
  if (Array.isArray(place.images) && place.images.length > 0) {
    place.images.forEach((img: any) => {
      const url = typeof img === "string" ? img : (img?.url || img?.original_url);
      if (url && !mediaList.includes(url)) mediaList.push(url);
    });
  }
  if (place.image && !mediaList.includes(place.image)) {
    mediaList.push(place.image);
  }
  if (mediaList.length === 0) {
    mediaList.push("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80");
  }

  const currentCover = mediaList[activeImageIdx] || mediaList[0];

  const categoryLabel =
    place.categories?.[0]?.display_name ||
    place.categories?.[0]?.name ||
    place.category ||
    "Địa điểm";

  return (
    <div className="max-w-5xl mx-auto w-full py-6 px-4 sm:px-6 space-y-6">
      {/* Top Navigation Bar: Back & Favorite */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          onClick={() => navigate("/location")}
          icon={<i className="fa-solid fa-arrow-left text-sm mr-1"></i>}
          className="rounded-2xl border-gray-200 dark:border-gray-800 font-semibold hover:border-[#FFCB37]"
        >
          Quay lại danh sách
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggleFavorite}
            loading={isTogglingFavorite}
            className={`rounded-2xl font-bold flex items-center gap-2 border transition-all ${
              isFavorited
                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900"
                : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            <i className={`fa-heart ${isFavorited ? "fa-solid text-red-500" : "fa-regular text-gray-400"}`} />
            <span>{isFavorited ? "Đã lưu yêu thích" : "Lưu địa điểm"}</span>
          </Button>
        </div>
      </div>

      {/* Main Place Banner & Gallery */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-sm" bodyStyle={{ padding: 0 }}>
        {/* Main Cover Image Preview */}
        <div className="h-72 sm:h-96 w-full relative group overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src={currentCover} 
            alt={place.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Rating Badge */}
          <div className="absolute top-4 left-6 bg-white/95 dark:bg-gray-900/90 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-md">
            <span className="text-[#FFCB37] font-black text-sm">★</span>
            <span className="text-black dark:text-white font-black text-sm">{Number(place.average_rating || place.rating || 5).toFixed(1)} / 5</span>
            <span className="text-xs text-gray-400">({reviews.length} đánh giá)</span>
          </div>

          {/* Category Tag */}
          <div className="absolute top-4 right-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFCB37] text-black shadow-md">
              {categoryLabel}
            </span>
          </div>

          {/* Slider Controls (if multiple media) */}
          {mediaList.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev - 1 + mediaList.length) % mediaList.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-md"
              >
                <i className="fa-solid fa-chevron-left text-sm" />
              </button>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % mediaList.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-md"
              >
                <i className="fa-solid fa-chevron-right text-sm" />
              </button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {mediaList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === activeImageIdx ? "bg-white w-6" : "bg-white/50 w-2"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {mediaList.length > 1 && (
          <div className="p-4 bg-gray-50/70 dark:bg-gray-850/50 border-b border-gray-100 dark:border-gray-800 flex gap-3 overflow-x-auto">
            {mediaList.map((thumbUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeImageIdx ? "border-[#FFCB37] scale-105 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Place Details Content */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-black dark:text-white leading-tight">
                {place.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2 mt-2">
                <i className="fa-solid fa-location-dot text-red-500 text-base mt-0.5 shrink-0" />
                <span className="font-semibold">{place.address}</span>
              </p>
            </div>

            {/* Quick Pricing Badge */}
            {place.average_price && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 shrink-0">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">Giá trung bình</span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                  {Number(place.average_price).toLocaleString("vi-VN")} đ
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">Giới thiệu địa điểm</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {place.description || "Chưa có mô tả chi tiết cho địa điểm này."}
            </p>
          </div>

          {/* Meta Attributes: Contact, Categories, Activity Groups, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* Contact & Map link */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Thông tin liên hệ</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {place.contact_phone && (
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-phone text-[#FFCB37] w-4" />
                    <span>{place.contact_phone}</span>
                  </p>
                )}
                {place.contact_email && (
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-envelope text-[#FFCB37] w-4" />
                    <span>{place.contact_email}</span>
                  </p>
                )}
                {place.latitude && place.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-xs"
                  >
                    <i className="fa-solid fa-map-location-dot" />
                    <span>Xem bản đồ Google Maps</span>
                  </a>
                )}
              </div>
            </div>

            {/* Tags & Activity Groups */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Phân loại & Hoạt động</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(place.activity_groups) && place.activity_groups.map((g: any) => (
                  <Tag key={g.id} color="purple" className="rounded-lg px-2.5 py-1 text-xs font-semibold">
                    {g.name}
                  </Tag>
                ))}
                {Array.isArray(place.categories) && place.categories.map((c: any) => (
                  <Tag key={c.id} color="gold" className="rounded-lg px-2.5 py-1 text-xs font-semibold">
                    {c.display_name || c.name}
                  </Tag>
                ))}
                {Array.isArray(place.tags) && place.tags.map((tag: any, i: number) => (
                  <Tag key={i} className="rounded-lg px-2.5 py-1 text-xs text-gray-600 bg-gray-100 border-none font-semibold">
                    #{typeof tag === "string" ? tag : tag?.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews & Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Write a review Form */}
        <div className="md:col-span-1">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-black text-black dark:text-white mb-1">Đánh giá & Bình luận</h3>
            <p className="text-xs text-gray-400 mb-4">Chia sẻ trải nghiệm thực tế của bạn tại {place.name}</p>

            {currentUser ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800">
                <Avatar src={currentUser.avatar} size={36} className="bg-amber-400 text-black font-bold">
                  {currentUser.name ? currentUser.name[0]?.toUpperCase() : "U"}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{currentUser.email || "Đang đăng nhập"}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl mb-4 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>Đăng nhập để gửi bình luận</span>
                <Button size="small" onClick={() => navigate("/auth")} className="text-xs font-bold bg-[#FFCB37] border-none rounded-lg">
                  Đăng nhập
                </Button>
              </div>
            )}

            <Form form={form} layout="vertical" onFinish={handleAddReview} className="space-y-4">
              <Form.Item 
                name="rating" 
                label={<span className="font-bold text-sm">Số sao đánh giá</span>} 
                rules={[{ required: true, message: "Vui lòng chọn số sao!" }]} 
                initialValue={5}
              >
                <Rate className="text-[#FFCB37]" style={{ color: "#FFCB37" }} />
              </Form.Item>

              <Form.Item
                name="comment"
                label={<span className="font-bold text-sm">Nội dung nhận xét</span>}
                rules={[{ required: true, message: "Vui lòng nhập bình luận đánh giá!" }]}
              >
                <Input.TextArea 
                  placeholder="Nhập cảm nhận của bạn về không gian, món ăn, dịch vụ, giá cả..." 
                  rows={4} 
                  maxLength={500}
                  showCount
                  className="rounded-xl border-gray-200 dark:border-gray-800" 
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingReview}
                className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-bold py-3 h-auto rounded-xl shadow-sm"
              >
                Gửi bình luận
              </Button>
            </Form>
          </Card>
        </div>

        {/* Existing reviews list */}
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-xl font-black text-black dark:text-white">Ý kiến cộng đồng ({reviews.length})</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                    <i className="fa-solid fa-star" />
                    <span>{Number(place.average_rating || place.rating || 5).toFixed(1)} / 5</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400 font-medium">{reviews.length} lượt đánh giá</span>
                </div>
              </div>

              {/* Rating Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedRatingFilter === "all"
                      ? "bg-[#FFCB37] text-black shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Tất cả ({reviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter((r) => Math.round(Number(r.rating)) === stars).length;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setSelectedRatingFilter(stars)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                        selectedRatingFilter === stars
                          ? "bg-[#FFCB37] text-black shadow-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <span>{stars}★</span>
                      <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List rendered with filtering */}
            {(() => {
              const filteredReviews = selectedRatingFilter === "all" 
                ? reviews 
                : reviews.filter((r) => Math.round(Number(r.rating)) === selectedRatingFilter);

              if (filteredReviews.length === 0) {
                return (
                  <div className="py-14 text-center text-gray-400">
                    <i className="fa-regular fa-comment-dots text-5xl mb-3 block opacity-40" />
                    <p className="font-semibold text-sm">
                      {selectedRatingFilter === "all"
                        ? "Chưa có đánh giá nào cho địa điểm này. Hãy là người đầu tiên chia sẻ cảm nhận!"
                        : `Không có đánh giá nào ${selectedRatingFilter} sao.`}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredReviews.map((rev) => {
                    const isMyReview = currentUser && rev.userId && Number(rev.userId) === Number(currentUser.id);
                    return (
                      <div key={rev.id} className="pt-5 first:pt-0 flex gap-4 group">
                        <Avatar 
                          src={rev.avatar} 
                          size={44} 
                          className="shrink-0 bg-amber-200 text-amber-800 font-bold"
                        >
                          {rev.user ? rev.user[0]?.toUpperCase() : "U"}
                        </Avatar>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-black dark:text-white text-sm truncate">{rev.user}</span>
                              {isMyReview && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-medium shrink-0">{rev.date}</span>
                              {isMyReview && (
                                <Tooltip title="Xóa bình luận của bạn">
                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="text-gray-300 hover:text-red-500 text-xs transition-colors p-1"
                                  >
                                    <i className="fa-regular fa-trash-can" />
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <Rate disabled defaultValue={rev.rating} className="text-xs text-[#FFCB37]" style={{ color: "#FFCB37" }} />
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-1 whitespace-pre-line">
                            {rev.comment}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
    </div>
  );
}
