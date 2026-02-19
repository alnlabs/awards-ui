import axios from "axios";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate instance for file uploads
export const apiFileUpload = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth interceptor to file upload instance
apiFileUpload.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for file uploads - let browser set it
    delete config.headers['Content-Type'];
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to file upload instance
apiFileUpload.interceptors.response.use(
  (response) => {
    const payload = response.data;
    
    if (payload?.status === "failure") {
      toast.error(payload.error || payload.message || "Request failed");
      return Promise.reject(payload);
    }
    
    return payload?.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      } else if (status === 403) {
        toast.error(data?.error || "Access denied");
      } else {
        toast.error(data?.error || data?.message || "Something went wrong");
      }
      
      return Promise.reject(data);
    }
    
    toast.error("Network error. Please check your connection.");
    return Promise.reject(error);
  }
);

/* =========================
   Request Interceptor
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
   🔥 SINGLE SOURCE OF TRUTH
========================= */
api.interceptors.response.use(
  (response) => {
    /**
     * FastAPI standard response:
     * {
     *   status: "success" | "failure",
     *   message: string,
     *   error: string | null,
     *   data: any
     * }
     */

    const payload = response.data;

    // Failure handled as error
    if (payload?.status === "failure") {
      toast.error(payload.error || payload.message || "Request failed");
      return Promise.reject(payload);
    }

    // ✅ ALWAYS return business data only
    return payload?.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      } else if (status === 403) {
        toast.error(data?.error || "Access denied");
      } else {
        toast.error(data?.error || data?.message || "Something went wrong");
      }

      return Promise.reject(data);
    }

    toast.error("Network error. Please check your connection.");
    return Promise.reject(error);
  }
);

export default api;
