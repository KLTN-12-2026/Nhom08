import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useCustomerStore from "../../stores/customerStore";
import RepositoryManager from "../../data/repositoryManager";
import useThemeStore from "../../stores/themeStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";
import LanguageSwitcher from "../../components/LanguageSwitcher.tsx";

export default function CustomerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const { theme, toggleTheme } = useThemeStore();
  const { t, currentLanguage } = useLanguageStore();

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
      setIsForgot(false);
    } else if (location.pathname === "/login") {
      setIsLogin(true);
      setIsForgot(false);
    }
  }, [location.pathname]);

  const onFinishLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await RepositoryManager.auth.login({
        email: values.email,
        password: values.password,
        rememberMe: true,
      });

      // Role check: Only allow role for normal user (typically role = 1 or user role, where admin is role = 0 or similar)
      const userObj = response.data?.user;
      if (userObj && (userObj.role === 0 || userObj.role === "admin")) {
        message.error(t("auth.adminCannotLoginUser"));
        setLoading(false);
        return;
      }

      // If valid, save session
      // set token in customerStore
      useCustomerStore.getState().setToken({
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenExpired: null,
        refreshTokenExpired: null,
      });
      useCustomerStore.getState().setUser(userObj);
      localStorage.setItem("customer_access_token", response.data.access_token);

      message.success(t("auth.loginSuccess"));
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      const errMsg = error?.response?.data?.msg || t("auth.loginFailed");
      message.error(errMsg);
      setLoading(false);
    }
  };

  const onFinishRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await RepositoryManager.auth.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.confirmPassword,
      });

      const resData = response.data || response;
      const userObj = resData?.user;
      const token = resData?.access_token;
      const refreshToken = resData?.refresh_token;

      // Auto sign in user if token is returned
      if (token && userObj) {
        useCustomerStore.getState().setToken({
          token: token,
          refreshToken: refreshToken || null,
          tokenExpired: null,
          refreshTokenExpired: null,
        });
        useCustomerStore.getState().setUser(userObj);
        localStorage.setItem("customer_access_token", token);

        message.success(t("auth.registerSuccess") || "Đăng ký tài khoản thành công!");
        setTimeout(() => {
          navigate("/");
        }, 800);
      } else {
        message.success(t("auth.registerSuccess") || "Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      const errors = error?.response?.data?.errors;
      let errMsg = "";
      if (errors && typeof errors === "object") {
        errMsg = Object.values(errors).flat().join(" ");
      } else {
        errMsg = error?.response?.data?.message || error?.response?.data?.msg || t("auth.registerFailed");
      }
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishForgot = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      message.success(t("auth.forgotSuccess"));
      setForgotEmailSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Left Column - Auth Form */}
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
            to="/"
            className={`inline-flex items-center gap-2 mb-8 sm:mb-12 transition-colors font-medium ${
              theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
            <span className="text-sm">{t("auth.backToHome")}</span>
          </Link>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h1
                className={`text-4xl sm:text-5xl font-bold tracking-tight ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {isForgot ? t("auth.recoverTitle") : isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
              </h1>
            </div>
            <p
              className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {isForgot
                ? t("auth.recoverSubtitle")
                : isLogin
                ? t("auth.welcomeBackCustomer")
                : t("auth.welcomeSubtitleCustomer")}
            </p>
          </div>

          {/* Style override for input backgrounds depending on theme */}
          <style dangerouslySetInnerHTML={{__html: `
            .premium-input {
              background-color: ${theme === "dark" ? "#1f293d" : "#f9fafb"} !important;
              border-color: ${theme === "dark" ? "#4b5563" : "#e5e7eb"} !important;
            }
            .premium-input input {
              color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
              background-color: transparent !important;
              border: none !important;
            }
            .premium-input input:-webkit-autofill,
            .premium-input input:-webkit-autofill:hover, 
            .premium-input input:-webkit-autofill:focus, 
            .premium-input input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 1000px ${theme === "dark" ? "#1f293d" : "#f9fafb"} inset !important;
              -webkit-text-fill-color: ${theme === "dark" ? "#ffffff" : "#000000"} !important;
              transition: background-color 5000s ease-in-out 0s;
            }
            .premium-input input::placeholder {
              color: #9ca3af !important;
            }
            .premium-input .ant-input-prefix {
              color: ${theme === "dark" ? "#9ca3af" : "#6b7280"} !important;
            }
          `}} />

          {!isForgot ? (
            <div>
              {isLogin ? (
                /* Single Pane - Login */
                <div className="space-y-6">
                  <Form name="login-form" onFinish={onFinishLogin} layout="vertical" className="space-y-4">
                    <Form.Item
                      name="email"
                      rules={[{ required: true, type: "email", message: t("auth.emailInvalid") }]}
                    >
                      <Input
                        prefix={<i className="fa-solid fa-envelope mr-2" />}
                        placeholder={t("auth.loginEmailPlaceholder")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: t("auth.passwordRequired") }]}
                    >
                      <Input.Password
                        prefix={<i className="fa-solid fa-lock mr-2" />}
                        placeholder={t("auth.password")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <div className="flex items-center justify-between pb-2">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <button
                          type="button"
                          style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: 0 }}
                        >
                          <input type="checkbox" id="remember-me" defaultChecked style={{ accentColor: "#FFCB37", cursor: "pointer" }} />
                          <label htmlFor="remember-me" style={{ color: theme === "dark" ? "#9ca3af" : "#4b5563", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}>{t("auth.rememberMe")}</label>
                        </button>
                      </Form.Item>

                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-amber-500 hover:text-amber-600 text-xs font-black tracking-wide uppercase transition-colors"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    </div>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-14 bg-[#FFCB37] hover:bg-[#E6B000] text-black font-bold rounded-full text-lg shadow-lg shadow-yellow-200/50 border-none transition-all transform hover:-translate-y-1"
                      >
                        {t("auth.signIn")}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div className="text-center mt-4">
                    <button
                      onClick={() => setIsLogin(false)}
                      style={{ background: "none", border: "none", color: theme === "dark" ? "#9ca3af" : "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
                      className="hover:text-amber-500 transition-colors"
                    >
                      {t("auth.noAccount")} <span style={{ color: "#FFCB37", fontWeight: "800" }}>{t("auth.signUpNow")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Single Pane - Register */
                <div className="space-y-6">
                  <Form name="register-form" onFinish={onFinishRegister} layout="vertical" className="space-y-4">
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: t("auth.fullNameRequired") }]}
                    >
                      <Input
                        prefix={<i className="fa-solid fa-user mr-2" />}
                        placeholder={t("auth.fullName")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[{ required: true, type: "email", message: t("auth.emailInvalid") }]}
                    >
                      <Input
                        prefix={<i className="fa-solid fa-envelope mr-2" />}
                        placeholder={t("auth.registerEmailPlaceholder")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, min: 6, message: t("auth.passwordMin") }]}
                    >
                      <Input.Password
                        prefix={<i className="fa-solid fa-lock mr-2" />}
                        placeholder={t("auth.password")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: t("auth.confirmPasswordRequired") },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error(t("auth.passwordMismatch")));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<i className="fa-solid fa-lock mr-2" />}
                        placeholder={t("auth.confirmPassword")}
                        size="large"
                        className="premium-input"
                        style={{
                          backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color: theme === "dark" ? "#ffffff" : "#000000",
                          borderRadius: "16px",
                          padding: "12px 16px",
                        }}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-14 bg-[#FFCB37] hover:bg-[#E6B000] text-black font-bold rounded-full text-lg shadow-lg shadow-yellow-200/50 border-none transition-all transform hover:-translate-y-1"
                      >
                        {t("auth.signUp")}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div className="text-center mt-4">
                    <button
                      onClick={() => setIsLogin(true)}
                      style={{ background: "none", border: "none", color: theme === "dark" ? "#9ca3af" : "#4b5563", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}
                      className="hover:text-amber-500 transition-colors"
                    >
                      {t("auth.hasAccount")} <span style={{ color: "#FFCB37", fontWeight: "800" }}>{t("auth.signInNow")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-6 max-w-md mx-auto">
              {!forgotEmailSent ? (
                <Form name="forgot-form" onFinish={onFinishForgot} layout="vertical" className="space-y-4">
                  <Form.Item
                    name="email"
                    rules={[{ required: true, type: "email", message: t("auth.emailInvalid") }]}
                  >
                    <Input
                      prefix={<i className="fa-solid fa-envelope mr-2.5" />}
                      placeholder={t("auth.forgotEmailPlaceholder")}
                      size="large"
                      className="premium-input"
                      style={{
                        backgroundColor: theme === "dark" ? "#1f293d" : "#f9fafb",
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        borderRadius: "16px",
                        padding: "12px 16px",
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      className="w-full h-14 bg-[#FFCB37] hover:bg-[#E6B000] text-black font-bold rounded-full text-lg shadow-lg shadow-yellow-200/50 border-none transition-all transform hover:-translate-y-1"
                    >
                      {t("auth.sendRequest")}
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div style={{ width: "64px", height: "64px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#4ade80", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                    <i className="fa-solid fa-check text-2xl" />
                  </div>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm font-semibold leading-relaxed`}>
                    {t("auth.resetSentDesc")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmailSent(false);
                      setIsForgot(false);
                    }}
                    className="w-full h-14 bg-[#FFCB37] hover:bg-[#E6B000] text-black font-bold rounded-full text-lg shadow-lg shadow-yellow-200/50 border-none transition-all transform hover:-translate-y-1"
                    style={{ cursor: "pointer" }}
                  >
                    {t("auth.ok")}
                  </button>
                </div>
              )}

              {!forgotEmailSent && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgot(false)}
                    className={`${theme === "dark" ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-black"} text-xs font-bold flex items-center justify-center gap-1.5 mx-auto uppercase tracking-wider transition-colors`}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <i className="fa-solid fa-arrow-left text-[10px]" /> {t("auth.backToLogin")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
