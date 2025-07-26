import apiClient from "./apiClient";

export interface CreatePostPayload {
  caption: string;
  themes: string[];
  media_url?: string | null;
  media_file?: File;
}

export interface Post {
  id: string;
  caption: string;
  themes: string[];
  media_url?: string | null;
  media_file?: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    profile_picture?: string;
  };
}

export const createPost = (data: CreatePostPayload): Promise<Post> => {
  const formData = new FormData();
  const post_data = {
        "caption":data.caption,
        "themes":data.themes,
        "media_url":data.media_url?data.media_url:null,
  }

  formData.append("post",JSON.stringify( post_data));
  if (data.media_file) {
    formData.append('media_file', data.media_file);
  }

  return apiClient.post("/content/posts/", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res) => res.data);
};

export const createPostWithMultipleFiles = (
  caption: string,
  themes: string[],
  mediaFiles: File[],
  mediaUrl?: string
): Promise<Post[]> => {
  const promises = mediaFiles.map(file => 
    createPost({
      caption,
      themes,
      media_file: file,
      media_url: mediaUrl || null
    })
  );
  
  return Promise.all(promises);
};