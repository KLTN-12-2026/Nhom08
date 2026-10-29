import axios from "axios";
import toast from "react-hot-toast";
import useDataMainStore from "../stores/dataMainStore";

// Base configuration
// Ưu tiên: env variable > localStorage > default (local)
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Ưu tiên đọc domain đã lưu trong localStorage
  const savedDomain = localStorage.getItem("api-base-url");
  if (savedDomain) {
    return savedDomain;
  }

  // Mặc định khởi tạo theo preference hoặc fallback về local
  const pref = localStorage.getItem("api-domain-preference") || "local";
  const DOMAINS_MAP = {
    local: "http://127.0.0.1:8000/api",
    dev: "https://bedev.trove.id.vn/api",
    production: "https://main.be.trove.id.vn/api",
  };
  const defaultDomain = DOMAINS_MAP[pref] || DOMAINS_MAP.local;
  localStorage.setItem("api-base-url", defaultDomain);
  localStorage.setItem("api-domain-preference", pref);
  return defaultDomain;
};

// Create axios instance với baseURL mặc định
const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Cập nhật baseURL động từ localStorage mỗi request
    const dynamicBaseURL = getBaseURL();
    if (config.baseURL !== dynamicBaseURL) {
      config.baseURL = dynamicBaseURL;
    }

    // Separate token retrieval based on target API url to prevent admin and user sessions from overriding each other
    let tokenVal = null;
    const isApiAdminRoute = config.url && (config.url.startsWith("admin/") || config.url.includes("/admin/"));

    if (isApiAdminRoute) {
      // For admin dashboard requests, read the admin-specific token
      tokenVal = localStorage.getItem("admin_access_token");
      if (!tokenVal) {
        try {
          const state = useDataMainStore.getState();
          if (state && state.user && (state.user.role === 0 || state.user.role === "admin")) {
            tokenVal = state.token;
          }
        } catch (e) {}
      }
    } else {
      // For customer/user side requests, read the customer-specific token
      tokenVal = localStorage.getItem("customer_access_token");
      if (!tokenVal) {
        try {
          const state = useDataMainStore.getState();
          if (state && state.token) {
            tokenVal = state.token;
          }
        } catch (e) {}
      }
    }

    if (!tokenVal) {
      const token = localStorage.getItem("admin-storage");
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          if (parsedToken.state?.token) {
            tokenVal = parsedToken.state.token;
          }
        } catch (error) {
          console.log("Error parsing token:", error);
        }
      }
    }

    if (tokenVal) {
      config.headers.Authorization = `Bearer ${tokenVal}`;
      config.headers["xtc-admin-token"] = tokenVal;
    }

    // Nếu data là FormData thì xóa Content-Type để browser tự set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    const { response } = error;

    // Requests flagged `silentError` handle failures themselves (no toast / redirect)
    if (error.config?.silentError) {
      return Promise.reject(error);
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Error:", {
        status: response?.status,
        url: error.config?.url,
        message: error.message,
        data: response?.data,
      });
    }

    // Handle different error status codes
    if (response) {
      switch (response.status) {
        case 401:
          if (response.data.msg_code === "WRONG_ACCOUNT_OR_PASSWORD") {
            return;
          } else {
            // Check if we're on a public route or user route
            const currentPath = window.location.pathname;
            const isAdminRoute = currentPath.startsWith("/admin");

            if (isAdminRoute) {
              console.warn("401 Unauthorized - Admin redirect disabled for UI demo");
            } else {
              console.warn("401 Unauthorized - User redirect disabled for UI demo");
            }
          }

          break;
        case 403:
          toast.error(response.data?.message || "Access denied. You do not have permission.");
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 422:
          toast.error(response.data?.message || "Validation error.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(response.data?.message || "An error occurred.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
