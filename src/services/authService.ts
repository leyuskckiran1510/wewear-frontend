import apiClient from "./apiClient";

export const requestOTP = (data: { email ? : string;phone ? : string }) => {
    return apiClient.post("/auth/request-otp", data);
};

export const verifyOTP = (data: { email ? : string;phone ? : string;code: string }) => {
    return apiClient.post("/auth/verify-otp", data).then((res) => {
        const token = res.data.access_token;
        if (token) {
            localStorage.setItem("token", token);
        }
        return res.data;
    });
};

export const logout = () => {
  localStorage.removeItem("token");
};