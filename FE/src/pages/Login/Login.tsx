"use client";

import React from "react";
import { Form, Input, Checkbox, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import useLoginStore from "./loginStore";
import useDataMainStore from "../../stores/dataMainStore";
import useThemeStore from "../../stores/themeStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";
import DomainBadge from "../../components/DomainBadge.tsx";
import LanguageSwitcher from "../../components/LanguageSwitcher.tsx";

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    email,
    password,
    rememberMe,
    isLoading,
    error,
    formErrors,
    setEmail,
    setPassword,
    setRememberMe,
    setFormErrors,
    login,
  } = useLoginStore();

  const dataMainStore = useDataMainStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, currentLanguage } = useLanguageStore();

  const handleInputChange = (field: string, value: any) => {
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
    switch (field) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "rememberMe":
        setRememberMe(value);
        break;
    }
  };

  const onFinish = async () => {
    await login(dataMainStore, navigate, toast);
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Left Column - Login Form */}
      <div
        className={`min-h-screen w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        {/* Controls - Top Right */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <LanguageSwitcher
            showLabel={true}
            className={`h-12 px-4 rounded-full flex items-center justify-center gap-2 transition-all transform hover:scale-105 border ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
          />
          <button
            onClick={toggleTheme}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 border ${
              theme === "dark"
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <i className="fa-solid fa-sun text-xl"></i>
            ) : (
              <i className="fa-solid fa-moon text-xl"></i>
            )}
          </button>
        </div>

        <div className="w-full max-w-md z-10">
          <Link
            to="/admin/dashboard"
            className={`inline-flex items-center gap-2 mb-8 sm:mb-12 transition-colors font-medium ${
              theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
            <span className="text-sm">{t("auth.backToDashboard")}</span>
          </Link>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h1
                className={`text-4xl sm:text-5xl font-bold tracking-tight ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {t("auth.helloAgain")}
              </h1>
              {/* Domain Label */}
              <DomainBadge size="md" />
            </div>
            <p
              className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("auth.welcomeBackAdmin")}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            className="space-y-6"
            onSubmitCapture={(e) => e.preventDefault()}
          >
            <Form.Item
              label={
                <span
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {t("auth.emailAddress")}
                </span>
              }
              name="email"
              rules={[
                { required: true, message: t("auth.emailRequired") },
                { type: "email", message: t("auth.emailInvalid") },
              ]}
              validateStatus={formErrors.email ? "error" : ""}
              help={formErrors.email || ""}
            >
              <Input
                size="large"
                placeholder={t("auth.emailPlaceholder")}
                className={`h-14 rounded-2xl border-transparent transition-all ${
                  theme === "dark"
                    ? "bg-gray-800 text-white placeholder-gray-500 hover:bg-gray-700 focus:bg-gray-700"
                    : "bg-gray-50 hover:bg-gray-100 focus:bg-white"
                }`}
                value={email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {t("auth.password")}
                </span>
              }
              name="password"
              rules={[
                { required: true, message: t("auth.passwordRequired") },
              ]}
              validateStatus={formErrors.password ? "error" : ""}
              help={formErrors.password || ""}
            >
              <Input.Password
                size="large"
                placeholder={t("auth.passwordPlaceholder")}
                className={`h-14 rounded-2xl border-transparent transition-all ${
                  theme === "dark"
                    ? "bg-gray-800 text-white placeholder-gray-500 hover:bg-gray-700 focus:bg-gray-700"
                    : "bg-gray-50 hover:bg-gray-100 focus:bg-white"
                }`}
                bordered={false}
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-8">
              <Checkbox
                checked={rememberMe}
                onChange={(e) =>
                  handleInputChange("rememberMe", e.target.checked)
                }
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {t("auth.rememberMe")}
              </Checkbox>
            </div>

            {error && (
              <div
                className={`rounded-2xl p-4 text-sm mb-6 font-medium border ${
                  theme === "dark"
                    ? "bg-red-900/20 text-red-400 border-red-800"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {error}
              </div>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                className="w-full h-14 bg-[#FFCB37] hover:bg-[#E6B000] text-black font-bold rounded-full text-lg shadow-lg shadow-yellow-200/50 border-none transition-all transform hover:-translate-y-1"
              >
                {t("auth.signIn")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
