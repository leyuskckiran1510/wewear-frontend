export interface Profile {
    username ? : string | null;
    full_name ? : string | null;
    bio ? : string | null;
    profile_picture ? : string | null;
    body_type ? : string | null;
    height ? : number | null;
    weight ? : number | null;
    themes: string[];
}

export interface UpdateProfile extends Partial < Omit < Profile, 'themes' >> {
    themes ? : string[];
}

export interface Post {
    id: number;
    author_id: string;
    author_username ? : string | null;
    media_url ? : string | null;
    caption ? : string | null;
    themes: string[];
    created_at: string;
    likes_count: number;
    comments_count: number;
    saves_count: number;
    shares_count: number;
    liked: boolean;
    saved: boolean;
}

export interface Comment {
    id: number;
    user_id: string;
    username: string;
    text: string;
    created_at: string;
}


type FeedType = "foryou" | "friends" | "explore" | "upload";
