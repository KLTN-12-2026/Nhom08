import React, { useState, useRef } from "react";
import { Form, Input, Avatar, message, Card, Upload } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";
import useCustomerStore from "../../stores/customerStore";
import RepositoryManager from "../../data/repositoryManager";

export default function CustomerAccount() {
  const { t } = useLanguageStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, setUser } = useCustomerStore();

  // Control which form is currently shown
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Local state initialized with user info dynamically
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone_number || user?.phone || "",
    avatar: user?.avatar || "",
  });

  React.useEffect(() => {
    // If user info is not full, refresh from /me
    const loadCurrentUser = async () => {
      try {
        const res = await RepositoryManager.auth.getMe();
        if (res && res.data) {
          const u = res.data;
          setUser(u);
          setProfile({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone_number || u.phone || "",
            avatar: u.avatar || "",
          });
          profileForm.setFieldsValue({
            name: u.name,
            email: u.email,
            phone: u.phone_number || u.phone,
          });
        }
      } catch (err) {
        console.warn("Could not fetch current customer info:", err);
      }
    };

    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || user.phone || "",
        avatar: user.avatar || "",
      });
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone_number || user.phone,
      });
    } else {
      loadCurrentUser();
    }
  }, [user, profileForm, setUser]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error("Dung lượng ảnh tối đa 10MB!");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await RepositoryManager.auth.updateAvatar(formData);
      if (res && (res.success || res.data)) {
        const updatedAvatar = res.data?.avatar || res.data?.avatar_url || URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, avatar: updatedAvatar }));
        if (user) {
          setUser({ ...user, avatar: updatedAvatar });
        }
        message.success("Cập nhật ảnh đại diện thành công!");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Tải ảnh đại diện thất bại!");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      setIsSaving(true);
      const res = await RepositoryManager.auth.updateProfile({
        name: values.name,
        phone_number: values.phone,
        gender: user?.gender || "other",
      });

      const updatedUser = res?.data || {
        ...user,
        name: values.name,
        phone_number: values.phone,
        phone: values.phone,
      };

      // Save changes to local state & store
      setProfile((prev) => ({
        ...prev,
        name: values.name,
        phone: values.phone,
      }));
      setUser(updatedUser);
      message.success(t("common.saveSuccess") || "Đã lưu thay đổi thành công!");
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message || error?.response?.data?.msg || "Cập nhật thông tin cá nhân thất bại!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (values: any) => {
    try {
      setIsSaving(true);
      await RepositoryManager.auth.updatePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        new_password_confirmation: values.confirmPassword,
      });
      message.success(
        t("publicPlaces.passwordUpdateSuccess") ||
          "Cập nhật mật khẩu thành công!",
      );
      passwordForm.resetFields();
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
          "Mật khẩu cũ không chính xác hoặc xác nhận mật khẩu không trùng khớp!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-6 font-sans text-gray-900 dark:text-gray-100 pb-24">
      {/* Web Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-5 mb-8">
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight font-display text-center">
          {isChangingPassword
            ? t("auth.changePassword")
            : t("auth.editProfile")}
        </h1>
        <p className="text-gray-500 font-semibold text-sm text-center mt-1">
          {isChangingPassword
            ? "Nhập mật khẩu cũ và thiết lập mật khẩu mới bảo mật hơn."
            : "Cập nhật thông tin hồ sơ cá nhân và quản lý bảo mật tài khoản."}
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.03)]">
        {!isChangingPassword ? (
          /* PROFILE INFO FORM */
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={profile}
            onFinish={handleSaveProfile}
            className="space-y-6"
          >
            {/* Circular Avatar Section with Camera Icon Overlay */}
            <div className="flex flex-col items-center justify-center space-y-3 pb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
                title="Nhấn để tải lên ảnh đại diện mới"
              >
                <Avatar
                  src={profile.avatar || undefined}
                  icon={
                    !profile.avatar && (
                      <i className="fa-solid fa-user text-5xl text-gray-400" />
                    )
                  }
                  size={110}
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-200/50 flex items-center justify-center shadow-inner"
                />
                <div className="absolute bottom-0 right-1 w-9 h-9 rounded-full bg-[#FFCB37] flex items-center justify-center shadow-md border-2 border-white hover:scale-105 transition-transform duration-200">
                  <i className={`fa-solid ${isUploadingAvatar ? "fa-spinner fa-spin" : "fa-camera"} text-sm text-black`} />
                </div>
              </div>
              <span
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                {isUploadingAvatar ? "Đang tải ảnh..." : "Thay đổi ảnh đại diện"}
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("auth.fullName")}
                </label>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  className="mb-0"
                >
                  <Input
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all"
                    placeholder="Họ và tên"
                  />
                </Form.Item>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("auth.email")}
                </label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập Email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                  className="mb-0"
                >
                  <Input
                    disabled
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all cursor-not-allowed opacity-60"
                    placeholder="Email"
                  />
                </Form.Item>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("auth.phoneNumber")}
                </label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all"
                    placeholder={t("auth.enterPhone")}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              {/* Save Changes Button */}
              <button
                type="submit"
                className="w-full h-14 bg-black dark:bg-white hover:opacity-90 text-white dark:text-black font-black rounded-2xl text-base shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-white dark:text-black font-black">
                  {t("common.saveChanges")}
                </span>
              </button>

              {/* Change Password Toggle Button */}
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="w-full h-14 bg-[#FFCB37] hover:opacity-90 text-black font-black rounded-2xl text-base shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-black font-black">
                  {t("auth.changePassword")}
                </span>
              </button>
            </div>
          </Form>
        ) : (
          /* CHANGE PASSWORD FORM */
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleUpdatePassword}
            className="space-y-6"
          >
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("publicPlaces.currentPassword")}
                </label>
                <Form.Item
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: t("publicPlaces.passwordRequired"),
                    },
                  ]}
                  className="mb-0"
                >
                  <Input.Password
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all"
                    placeholder="••••••••"
                  />
                </Form.Item>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("publicPlaces.newPassword")}
                </label>
                <Form.Item
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: t("publicPlaces.passwordRequired"),
                    },
                  ]}
                  className="mb-0"
                >
                  <Input.Password
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all"
                    placeholder="••••••••"
                  />
                </Form.Item>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2 block">
                  {t("publicPlaces.confirmNewPassword")}
                </label>
                <Form.Item
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: t("publicPlaces.passwordRequired"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("publicPlaces.passwordMismatch")),
                        );
                      },
                    }),
                  ]}
                  className="mb-0"
                >
                  <Input.Password
                    className="w-full h-13 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 focus:bg-white text-sm font-semibold transition-all"
                    placeholder="••••••••"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6">
              {/* Update Password Button */}
              <button
                type="submit"
                className="w-full h-14 bg-black dark:bg-white hover:opacity-90 text-white dark:text-black font-black rounded-2xl text-base shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-white dark:text-black font-black">
                  {t("publicPlaces.updatePasswordBtn")}
                </span>
              </button>

              {/* Back to Profile Form Button */}
              <button
                type="button"
                onClick={() => {
                  passwordForm.resetFields();
                  setIsChangingPassword(false);
                }}
                className="w-full h-14 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-black rounded-2xl text-base shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                <span>{t("common.cancel")}</span>
              </button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
