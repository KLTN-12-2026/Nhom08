import { create } from "zustand";
import RepositoryManager from "../../data/repositoryManager";
import useLanguageStore from "../../stores/languageStore.ts";

const useLoginStore = create((set, get) => ({
  // Form state
  email: "kuncutelovely@gmail.com",
  password: "admin123",
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
      const response = await RepositoryManager.auth.login({
        email,
        password,
        rememberMe,
      });

      // Check user role: Only allow admin (role 0 or "admin")
      const userObj = response.data?.user;
      if (userObj && userObj.role !== 0 && userObj.role !== "admin") {
        toast.error(useLanguageStore.getState().t("auth.customerCannotLoginAdmin"));
        return { success: false, error: "Access denied" };
      }

      // Set token and user in dataMainStore
      dataMainStore.setToken({
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenExpired: null, // API doesn't return expiration
        refreshTokenExpired: null, // API doesn't return expiration
      });
      dataMainStore.setUser(response.data.user);
      localStorage.setItem("admin_access_token", response.data.access_token);

      toast.success(useLanguageStore.getState().t("auth.loginSuccess"));
      resetForm();

      // Navigate to dashboard
      if (navigate) {
        navigate("/admin/home", { replace: true });
      }

      return { success: true, data: response.data };
    } catch (err) {
      console.log("Lỗi đăng nhập:", err);
      const message =
        err?.response?.data?.msg || useLanguageStore.getState().t("auth.loginFailed");
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  },
}));

export default useLoginStore;
