import axios from "axios";
import ENV from "@/config";
import toast from "react-hot-toast";

const apiClient = axios.create({
    baseURL: `${ENV.BASE_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    const isAuthError =
      status === 401 || // Unauthorized
      (status === 400 && detail === "Signature verification failed");

    if (isAuthError) {
      toast.error(detail || "Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default apiClient;