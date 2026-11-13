import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Form, Input, Rate, Avatar, message, Upload, Select, InputNumber } from "antd";
import { activityGroups } from "../../data/remote/activityGroups";
import tagsAPI from "../../data/remote/tags";
import categoriesAPI from "../../data/remote/categories";
import useDataMainStore from "../../stores/dataMainStore.js";
import placesAPI from "../../data/remote/places";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;
const { Option } = Select;

interface Review {
  id: number;
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
      // Map reviews từ API response
      const rawReviews = data?.reviews || data?.data?.reviews || [];
      setReviews(
        rawReviews.map((r: any) => ({
          id: r.id,
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

  const loadOptions = async () => {
    try {
      const tagRes = await tagsAPI.getTags();
      if (tagRes.success && tagRes.data) {
        setTagOptions(tagRes.data.data.map((t: any) => ({ id: t.id, name: t.name })));
      }

      const catRes = await categoriesAPI.getCategories();
      if (catRes.success && catRes.data) {
        setCategoryOptions(catRes.data.data.map((c: any) => ({ id: c.id, name: c.display_name })));
      }

      const groupRes = await activityGroups.getGroups();
      if (groupRes.success && groupRes.data && Array.isArray(groupRes.data.data)) {
        setActivityGroupOptions(groupRes.data.data.map((g: any) => ({ id: g.id, name: g.name })));
      }
    } catch (e) {
      console.error("Failed to load options", e);
    }
  };

  const handleAddReview = async (values: any) => {
    try {
      const payload = {
        place_id: Number(id),
        rating: values.rating,
        comment: values.comment,
      };
      const res = await placesAPI.createReview(payload);
      if (res?.success || res?.data) {
        const newReview: Review = {
          id: res.data?.id || Date.now(),
          user: res.data?.user?.name || "Bạn",
          avatar: res.data?.user?.avatar || "",
          rating: values.rating,
          comment: values.comment,
          date: new Date().toISOString().split("T")[0],
        };
        setReviews([newReview, ...reviews]);
        form.resetFields();
        message.success("Cảm ơn bạn đã bình luận đánh giá địa điểm!");
      } else {
        message.error(res?.message || "Gửi đánh giá thất bại.");
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  const handleCreatePlace = async (values: any) => {
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
      
      if (result.success) {
        const placeId = result.data?.id || result.data?.data?.id || result.place?.id || Date.now();
        // Form post representation for local store update
        const newPost = {
          id: placeId,
          title: result.data?.name || result.data?.data?.name || values.name || "Địa điểm mới",
          category: values.category_ids && values.category_ids.length > 0 
            ? (categoryOptions.find(c => c.id === values.category_ids[0])?.name || "Địa điểm")
            : "Địa điểm",
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          image: (result.data?.media && result.data.media.length > 0)
            ? result.data.media[0].url
            : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80",
          description: values.description || "Chưa có mô tả chi tiết."
        };
        addPost(newPost);
        message.success("Đăng địa điểm mới thành công! Hệ thống đang kiểm duyệt.");
        navigate("/my-posts");
      } else {
        message.error(result.message || "Đăng địa điểm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm địa điểm:", error);
      message.error("Có lỗi xảy ra khi kết nối tới máy chủ.");
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
              <Button onClick={() => navigate("/my-posts")}>Cancel</Button>
              <Button type="primary" htmlType="submit">
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
      <div className="max-w-4xl mx-auto w-full py-16 flex justify-center items-center">
        <div className="text-center space-y-3">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-[#FFCB37]" />
          <p className="text-gray-500 font-semibold">Đang tải thông tin địa điểm...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-4xl mx-auto w-full py-16 text-center">
        <p className="text-gray-400 font-semibold">Không tìm thấy địa điểm này.</p>
      </div>
    );
  }

  // Lấy ảnh đầu tiên từ media array, fallback placeholder
  const coverImage =
    place.media?.[0]?.original_url ||
    place.media?.[0]?.url ||
    place.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80";
  const categoryLabel =
    place.categories?.[0]?.display_name ||
    place.categories?.[0]?.name ||
    place.category ||
    "Địa điểm";

  return (
    <div className="max-w-4xl mx-auto w-full py-4 space-y-6">
      {/* Cover Image & Basic Info Card */}
      <Card className="bg-white dark:bg-gray-900 border-none rounded-[32px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.04)]" bodyStyle={{ padding: 0 }}>
        <div className="h-64 sm:h-80 w-full relative">
          <img src={coverImage} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5 shadow-md">
            <span className="text-black font-black text-sm">★ {Number(place.average_rating || 0).toFixed(1)} / 5</span>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-3xl font-black text-black dark:text-white leading-tight">{place.name}</h2>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFCB37]/15 text-[#E6B000]">
              {categoryLabel}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex items-start gap-2">
            <i className="fa-solid fa-location-dot text-red-500 text-base mt-0.5 shrink-0" />
            <span className="font-semibold">{place.address}</span>
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2 border-t border-gray-50 dark:border-gray-800">
            {place.description}
          </p>
        </div>
      </Card>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Write a review Form */}
        <div className="md:col-span-1">
          <Card className="bg-white dark:bg-gray-900 border-none rounded-[32px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-black dark:text-white mb-4">Đánh giá địa điểm</h3>
            <Form form={form} layout="vertical" onFinish={handleAddReview} className="space-y-4">
              <Form.Item name="rating" label={<span className="font-bold text-sm">Số sao</span>} rules={[{ required: true }]}>
                <Rate className="text-[#FFCB37]" style={{ color: "#FFCB37" }} />
              </Form.Item>

              <Form.Item
                name="comment"
                label={<span className="font-bold text-sm">Bình luận</span>}
                rules={[{ required: true, message: "Vui lòng nhập bình luận!" }]}
              >
                <Input.TextArea placeholder="Cảm nhận của bạn về địa điểm này..." rows={3} className="rounded-xl border-gray-200 dark:border-gray-800" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="w-full bg-[#FFCB37] hover:bg-[#FFCB37]/90 text-black border-none font-bold py-2.5 h-auto rounded-xl"
              >
                Gửi bình luận
              </Button>
            </Form>
          </Card>
        </div>

        {/* Existing reviews list */}
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-gray-900 border-none rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl font-black text-black dark:text-white mb-6">Ý kiến cộng đồng ({reviews.length})</h3>
            <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 flex gap-4">
                  <Avatar src={rev.avatar} size={40} className="shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-black dark:text-white text-sm">{rev.user}</span>
                      <span className="text-xs text-gray-400 font-semibold">{rev.date}</span>
                    </div>
                    <Rate disabled defaultValue={rev.rating} className="text-xs text-[#FFCB37]" style={{ color: "#FFCB37" }} />
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
