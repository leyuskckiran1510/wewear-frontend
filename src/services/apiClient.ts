import axios from "axios";
import ENV from "@/config";

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

export default apiClient;