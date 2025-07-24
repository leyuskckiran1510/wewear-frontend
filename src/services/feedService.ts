import apiClient from "./apiClient";
import { Post,FeedType } from "./types";

export const getFeed = (type: FeedType): Promise<Post | { detail: string }> => {
  return apiClient
    .get(`/content/feeds/${type}/`)
    .then((res) => res.data);
};

export const getUploadFeed = (
  offset = 0,
  limit = 20
): Promise<{ posts: Post[]; total: number; offset: number; limit: number }> => {
  return apiClient
    .get("/content/feeds/upload/", { params: { offset, limit } })
    .then((res) => res.data);
};
