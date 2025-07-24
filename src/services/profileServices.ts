import apiClient from "./apiClient";
import { Profile, UpdateProfile } from "./types";


export const getProfile = (): Promise < Profile > =>
    apiClient.get("/profile/profile").then((res) => res.data);

export const updateProfile = (data: UpdateProfile): Promise < Profile > =>
    apiClient.put("/profile/profile", data).then((res) => res.data);