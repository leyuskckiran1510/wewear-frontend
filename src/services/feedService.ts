import apiClient from "./apiClient";
import { Post } from "./types";

export const getForYouFeed = (): Promise < Post[] > =>
    apiClient.get("/content/feeds/foryou/").then((res) => res.data);

export const getFriendsFeed = (): Promise < Post[] > =>
    apiClient.get("/content/feeds/friends/").then((res) => res.data);

export const getExploreFeed = (): Promise < Post[] > =>
    apiClient.get("/content/feeds/explore/").then((res) => res.data);

export const getUploadFeed = (offset = 0, limit = 20): Promise < {
        posts: Post[];
        total: number;
        offset: number;
        limit: number;
    } > =>
    apiClient
    .get("/content/feeds/upload/", { params: { offset, limit } })
    .then((res) => res.data);