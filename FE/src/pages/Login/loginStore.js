import { create } from "zustand";
import RepositoryManager from "../../data/repositoryManager";
import useLanguageStore from "../../stores/languageStore.ts";

const useLoginStore = create((set, get) => ({
  // Form state
  email: "admin@trove.vn",
  password: "123456789",
  rememberMe: false,

  // UI state
  isLoading: false,
  error: null,
  formErrors: {},

  // Actions
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setRememberMe: (rememberMe) => set({ rememberMe }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFormErrors: (formErrors) => set({ formErrors }),

  validateForm: () => {
    const { email, password } = get();
    const errors = {};
    const t = useLanguageStore.getState().t;

    if (!email) {
      errors.email = t("auth.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t("auth.emailInvalid");
    }

    if (!password) {
      errors.password = t("auth.passwordRequired");
    } else if (password.length < 6) {
      errors.password = t("auth.passwordMin");
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  resetForm: () => {
    set({
      email: "",
      password: "",
      rememberMe: false,
      isLoading: false,
      error: null,
      formErrors: {},
    });
  },

  // Login action - tách logic từ component
  login: async (dataMainStore, navigate, toast) => {
    const { email, password, rememberMe, validateForm, setLoading, setError, setFormErrors, resetForm } = get();

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return { success: false, error: "Validation failed" };
    }

    setFormErrors({});
    setError(null);
    setLoading(true);

    try {
      // Ưu tiên gọi API admin/login chuyên biệt cho trang Admin
      const loginFn = RepositoryManager.auth.loginAdmin || RepositoryManager.auth.login;
      const response = await loginFn({
        email,
        password,
        rememberMe,
      });

      const resData = response.data || response;
      const userObj = resData?.user;

      // Check user role: Only allow admin (role 0 or "admin")
      if (userObj && userObj.role !== 0 && userObj.role !== "admin") {
        toast.error(useLanguageStore.getState().t("auth.customerCannotLoginAdmin"));
        setError(useLanguageStore.getState().t("auth.customerCannotLoginAdmin"));
        return { success: false, error: "Access denied" };
      }

      const accessToken = resData?.access_token || resData?.token;
      const refreshToken = resData?.refresh_token;

      // Set token and user in dataMainStore
      dataMainStore.setToken({
        token: accessToken,
        refreshToken: refreshToken,
        tokenExpired: null,
        refreshTokenExpired: null,
      });
      if (userObj) {
        dataMainStore.setUser(userObj);
      }
      if (accessToken) {
        localStorage.setItem("admin_access_token", accessToken);
      }

      toast.success(useLanguageStore.getState().t("auth.loginSuccess") || "Đăng nhập thành công!");
      resetForm();

      // Navigate to dashboard / home
      if (navigate) {
        navigate("/admin/home", { replace: true });
      }

      return { success: true, data: resData };
    } catch (err) {
      console.log("Lỗi đăng nhập:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        useLanguageStore.getState().t("auth.loginFailed") ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu!";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  },
}));

export default useLoginStore;
