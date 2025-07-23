export interface Post {
  id: number;
  author_id: string;
  author_username?: string | null;
  media_url?: string | null;
  caption?: string | null;
  themes: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  liked: boolean;
  saved: boolean;
}
