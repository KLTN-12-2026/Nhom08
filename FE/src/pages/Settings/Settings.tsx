"use client";

import React, { useState } from "react";
import { Card, Switch, Alert, Divider, message } from "antd";
import useLanguageStore from "../../stores/languageStore.ts";

export default function Settings() {
    const { t } = useLanguageStore();

    // Mock state for reporting / demo
    const [userLimitsEnabled, setUserLimitsEnabled] = useState(true);
    const [placeAutoApprove, setPlaceAutoApprove] = useState(false);
    const [isSavingUserLimits, setIsSavingUserLimits] = useState(false);
    const [isSavingPlaceAuto, setIsSavingPlaceAuto] = useState(false);

    const handleToggleUserLimits = (checked: boolean) => {
        setIsSavingUserLimits(true);
        setTimeout(() => {
            setUserLimitsEnabled(checked);
            setIsSavingUserLimits(false);
            message.success(
                checked
                    ? "Đã kích hoạt giới hạn người dùng (User Limits: Bật)"
                    : "Đã vô hiệu hóa giới hạn người dùng (User Limits: Tắt)"
            );
        }, 300);
    };

    const handleTogglePlaceAutoApprove = (checked: boolean) => {
        setIsSavingPlaceAuto(true);
        setTimeout(() => {
            setPlaceAutoApprove(checked);
            setIsSavingPlaceAuto(false);
            message.success(
                checked
                    ? "Đã bật tự động duyệt địa điểm cho toàn hệ thống"
                    : "Đã tắt tự động duyệt. Địa điểm người dùng thường sẽ chờ xét duyệt"
            );
        }, 300);
    };

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                    <span>{t("common.home") || "Trang chủ"}</span>
                    <span>/</span>
                    <span className="text-black dark:text-white">{t("navigation.settings") || "Cài đặt hệ thống"}</span>
                </div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t("settings.title") || "Cài đặt & Cấu hình Hệ thống"}
                </h1>
                <p className="text-gray-500">
                    {t("settings.subtitle") || "Quản lý cơ chế phê duyệt địa điểm, giới hạn tài khoản và các chính sách hệ thống"}
                </p>
            </div>

            {/* User Limits Settings Card */}
            <Card
                className="shadow-soft rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <i className="fa-solid fa-user-lock text-blue-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black dark:text-white m-0">
                                {t("settings.userLimits.title") || "Giới hạn Người dùng (User Limits)"}
                            </h3>
                            <p className="text-sm text-gray-500 font-normal m-0">
                                {t("settings.userLimits.subtitle") || "Kiểm soát giới hạn tạo lịch hẹn, địa điểm và tìm kiếm theo gói thành viên"}
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Alert
                        message={t("settings.userLimits.aboutTitle") || "Về cơ chế giới hạn tài khoản"}
                        description={
                            <div className="space-y-2">
                                <p className="mb-1 text-sm">
                                    <strong>{t("settings.userLimits.enabled") || "Bật"}:</strong>{" "}
                                    {t("settings.userLimits.enabledDescription") || "Áp dụng định ngạch theo gói tài khoản (Standard / Premium) đối với số lần lưu địa điểm và tạo kế hoạch."}
                                </p>
                                <p className="mb-0 text-sm">
                                    <strong>{t("settings.userLimits.disabled") || "Tắt"}:</strong>{" "}
                                    {t("settings.userLimits.disabledDescription") || "Không giới hạn số lượt thao tác của người dùng trên toàn hệ thống."}
                                </p>
                            </div>
                        }
                        type="info"
                        showIcon
                        icon={<i className="fa-solid fa-circle-info"></i>}
                        className="rounded-xl"
                    />

                    <Divider className="my-4" />

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    userLimitsEnabled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                }`}
                            >
                                <i
                                    className={`fa-solid ${
                                        userLimitsEnabled ? "fa-lock text-green-600" : "fa-lock-open text-red-600"
                                    } text-xl`}
                                ></i>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                    {t("settings.userLimits.statusTitle") || "Trạng thái áp dụng giới hạn"}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {userLimitsEnabled
                                        ? t("settings.userLimits.limitsActive") || "Đang bật - Giới hạn theo phân hạng thành viên đang có hiệu lực"
                                        : t("settings.userLimits.limitsDisabled") || "Đang tắt - Không áp dụng giới hạn"}
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={userLimitsEnabled}
                            onChange={handleToggleUserLimits}
                            loading={isSavingUserLimits}
                            checkedChildren={<i className="fa-solid fa-check"></i>}
                            unCheckedChildren={<i className="fa-solid fa-xmark"></i>}
                        />
                    </div>

                    {userLimitsEnabled ? (
                        <Alert
                            message="Giới hạn người dùng đang hoạt động"
                            description="Tài khoản thường sẽ tuân thủ hạn mức ngày. Tài khoản Premium không bị giới hạn."
                            type="success"
                            showIcon
                            icon={<i className="fa-solid fa-circle-check"></i>}
                            className="rounded-xl"
                        />
                    ) : (
                        <Alert
                            message="Giới hạn người dùng đang tạm tắt"
                            description="Tất cả người dùng hiện có thể tự do tạo lịch hẹn và đóng góp không giới hạn."
                            type="warning"
                            showIcon
                            icon={<i className="fa-solid fa-triangle-exclamation"></i>}
                            className="rounded-xl"
                        />
                    )}
                </div>
            </Card>

            {/* Place Auto Approve Settings Card */}
            <Card
                className="shadow-soft rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <i className="fa-solid fa-check-circle text-emerald-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black dark:text-white m-0">
                                Tự động Phê duyệt Địa điểm (Place Auto Approve)
                            </h3>
                            <p className="text-sm text-gray-500 font-normal m-0">
                                Cấu hình phê duyệt địa điểm mới khi người dùng hoặc đối tác đóng góp
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Alert
                        message="Về tính năng Auto Approve địa điểm"
                        description={
                            <div className="space-y-2">
                                <p className="mb-1 text-sm">
                                    <strong>Bật:</strong> Mọi địa điểm mới do bất kỳ người dùng nào đóng góp đều được duyệt ngay lập tức (Status = APPROVED) và hiển thị tức thời.
                                </p>
                                <p className="mb-0 text-sm">
                                    <strong>Tắt:</strong> Địa điểm đóng góp từ người dùng thường sẽ ở trạng thái chờ duyệt (WAITING) để ban quản trị kiểm duyệt nội dung và hình ảnh.
                                </p>
                            </div>
                        }
                        type="info"
                        showIcon
                        icon={<i className="fa-solid fa-circle-info"></i>}
                        className="rounded-xl"
                    />

                    <Divider className="my-4" />

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    placeAutoApprove ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                                }`}
                            >
                                <i
                                    className={`fa-solid ${
                                        placeAutoApprove ? "fa-check-double text-emerald-600" : "fa-clock text-amber-600"
                                    } text-xl`}
                                ></i>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                    Trạng thái Auto Approve
                                </div>
                                <div className="text-sm text-gray-500">
                                    {placeAutoApprove
                                        ? "Đang bật - Tất cả địa điểm được tự động phê duyệt"
                                        : "Đang tắt - Yêu cầu kiểm duyệt thủ công bởi Admin"}
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={placeAutoApprove}
                            onChange={handleTogglePlaceAutoApprove}
                            loading={isSavingPlaceAuto}
                            checkedChildren={<i className="fa-solid fa-check"></i>}
                            unCheckedChildren={<i className="fa-solid fa-xmark"></i>}
                        />
                    </div>

                    {placeAutoApprove ? (
                        <Alert
                            message="Chế độ Tự động Phê duyệt đang BẬT"
                            description="Tất cả địa điểm mới được gửi lên sẽ được phát hành ngay trên ứng dụng."
                            type="success"
                            showIcon
                            icon={<i className="fa-solid fa-circle-check"></i>}
                            className="rounded-xl"
                        />
                    ) : (
                        <Alert
                            message="Chế độ Tự động Phê duyệt đang TẮT"
                            description="Các địa điểm gửi lên sẽ lưu vào hàng đợi chờ duyệt để đảm bảo chất lượng nội dung."
                            type="warning"
                            showIcon
                            icon={<i className="fa-solid fa-triangle-exclamation"></i>}
                            className="rounded-xl"
                        />
                    )}
                </div>
            </Card>

            {/* Other System Settings */}
            <Card
                className="shadow-soft rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-80"
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <i className="fa-solid fa-sliders text-purple-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black dark:text-white m-0">
                                {t("settings.generalSettings.title") || "Cấu hình Mở rộng khác"}
                            </h3>
                            <p className="text-sm text-gray-500 font-normal m-0">
                                {t("settings.generalSettings.comingSoon") || "Tích hợp AI Prompt và Cấu hình SMS/OTP"}
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="text-center py-6 text-gray-400">
                    <i className="fa-solid fa-microchip text-4xl mb-3 text-purple-400"></i>
                    <p className="text-sm text-gray-500 m-0">
                        {t("settings.generalSettings.additionalSettings") || "Module sẵn sàng liên kết các cấu hình thông số AI Gemini và cổng tích hợp ngoài."}
                    </p>
                </div>
            </Card>
        </div>
    );
}

