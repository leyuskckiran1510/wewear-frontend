import React, { useEffect, useState } from "react";
import { getForYouFeed } from "@/services/feedService";
import { Post } from "@/services/types";
import {
    likePost,
    savePost,
    commentPost,
    sharePost,
} from "@/services/postInteractionService";
import { Media } from "@/components/CostumeTags";

type FeedResponse = Post | { detail: string };

const FeedForYou: React.FC = () => {
    const [post, setPost] = useState < Post | null > (null);
    const [message, setMessage] = useState < string > ("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [commentText, setCommentText] = useState("");
    const [shareSlug, setShareSlug] = useState("");

    useEffect(() => {
        setLoading(true);
        getForYouFeed()
            .then((data: FeedResponse) => {
                if ("detail" in data && data.detail) {
                    setMessage(data.detail);
                    setPost(null);
                } else if ("error" in data && data.error) {
                    setError(data.error);
                } else {
                    setPost(data);
                    setMessage("");
                }
            })
            .catch(() => setError("Failed to load feed"))
            .finally(() => setLoading(false));
    }, []);

    const handleLike = () => {
        if (!post) return;
        likePost(post.id)
            .then(() => {
                setPost({
                    ...post,
                    liked: !post.liked,
                    likes_count: post.likes_count + (post.liked ? -1 : 1),
                });
            })
            .catch(() => alert("Failed to like post"));
    };

    const handleSave = () => {
        if (!post) return;
        savePost(post.id)
            .then(() => {
                setPost({
                    ...post,
                    saved: !post.saved,
                    saves_count: post.saves_count + (post.saved ? -1 : 1),
                });
            })
            .catch(() => alert("Failed to save post"));
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !commentText.trim()) return;

        commentPost(post.id, commentText)
            .then(() => {
                setCommentText("");
                alert("Comment posted");
            })
            .catch(() => alert("Failed to post comment"));
    };

    const handleShare = () => {
        if (!post) return;

        sharePost(post.id)
            .then(({ slug }) => {
                setShareSlug(slug);
                navigator.clipboard.writeText(
                    `${window.location.origin}/api/content/share/${slug}/`
                );
                alert("Share link copied!");
            })
            .catch(() => alert("Failed to share post"));
    };

    if (loading) return <div>Loading post...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (message) return <div>{message}</div>;
    if (!post) return <div>No post available.</div>;

    return (
        <div style={{ maxWidth: 600, margin: "auto", paddingTop: 30 }}>
      <h2>For You</h2>
      <div
        style={{
          marginBottom: 20,
          borderBottom: "1px solid #ddd",
          paddingBottom: 10,
        }}
      >
        <div>
          <strong>{post.author_username || "Unknown"}</strong>
        </div>

        {post.media_url && (
          <Media
            src={post.media_url}
            alt=""
            style={{ maxWidth: "100%", marginTop: 10 }}
          />
        )}

        <div style={{ marginTop: 10 }}>{post.caption}</div>
        <div>Themes: {post.themes.filter(Boolean).join(", ")}</div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleLike}>
            {post.liked ? "Unlike" : "Like"} ({post.likes_count})
          </button>

          <button onClick={handleSave} style={{ marginLeft: 10 }}>
            {post.saved ? "Unsave" : "Save"} ({post.saves_count})
          </button>
        </div>

        <form onSubmit={handleComment} style={{ marginTop: 10 }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment"
            style={{ width: "70%", marginRight: 10 }}
          />
          <button type="submit">Comment</button>
        </form>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleShare}>Share</button>
          {shareSlug && (
            <div>
              Shared link: <code>/api/content/share/{shareSlug}/</code>
            </div>
          )}
        </div>
      </div>
    </div>
    );
};

export default FeedForYou;