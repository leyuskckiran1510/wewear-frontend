import apiClient from "./apiClient";

export interface Profile {
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  body_type?: string | null;
  height?: number | null;
  weight?: number | null;
  themes: string[];
}

export interface UpdateProfile extends Partial<Omit<Profile, 'themes'>> {
  themes?: string[];
}

export const getProfile = (): Promise<Profile> =>
  apiClient.get("/profile/profile").then((res) => res.data);

export const updateProfile = (data: UpdateProfile): Promise<Profile> =>
  apiClient.put("/profile/profile", data).then((res) => res.data);
