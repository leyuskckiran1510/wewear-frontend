import React, { useEffect, useState } from "react";
import { getFeed, getUploadFeed } from "@/services/feedService";
import { Post, PaginatedPosts, FeedType } from "@/services/types";
import { Media } from "@/components/CostumeTags";
import {
  likePost,
  savePost,
  commentPost,
  sharePost,
} from "@/services/postInteractionService";
import { useLoader } from "@/context/LoaderContext";
import toast from "react-hot-toast";
import "@/styles/Feed.css";


interface Props {
  feedType: FeedType;
}

const Feed: React.FC<Props> = ({ feedType }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string>("");
  const { showLoader, hideLoader } = useLoader();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
      // Reset state when feedType changes
      setPosts([]);
      setOffset(0);
      setHasMore(true);
      setMessage("");
      fetchFeed(0); // reset offset to 0
    }, [feedType]);


  const fetchFeed = (offsetValue: number = offset) => {
      showLoader();

      const fetchFn =
        feedType === "upload"
          ? getUploadFeed(offsetValue, PAGE_SIZE)
          : getFeed(feedType);

      fetchFn
        .then((data: any) => {
          if ("detail" in data) {
            setMessage(data.detail);
            if (feedType === "upload") setHasMore(false);
          } else if ("posts" in data) {
            const paginated = data as PaginatedPosts;
            setPosts((prev) =>
              offsetValue === 0 ? paginated.posts : [...prev, ...paginated.posts]
            );
            setOffset(offsetValue + PAGE_SIZE);
            setHasMore(paginated.posts.length === PAGE_SIZE);
          } else {
            setPosts((prev) =>
              offsetValue === 0 ? [data as Post] : [...prev, data as Post]
            );
          }
        })
        .catch(() => toast.error("Failed to load feed"))
        .finally(() => hideLoader());
    };


  const handleLike = (post: Post) => {
    likePost(post.id)
      .then(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  liked: !p.liked,
                  likes_count: p.likes_count + (post.liked ? -1 : 1),
                }
              : p
          )
        );
      })
      .catch(() => toast.error("Failed to like post"));
  };

  const handleSave = (post: Post) => {
    savePost(post.id)
      .then(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  saved: !p.saved,
                  saves_count: p.saves_count + (post.saved ? -1 : 1),
                }
              : p
          )
        );
      })
      .catch(() => toast.error("Failed to save post"));
  };

  const handleComment = (post: Post, text: string) => {
    if (!text.trim()) return;
    commentPost(post.id, text)
      .then(() => {
        toast.error("Comment posted");
      })
      .catch(() => toast.error("Failed to post comment"));
  };

  const handleShare = (post: Post) => {
    sharePost(post.id)
      .then(({ slug }) => {
        navigator.clipboard.writeText(
          `${window.location.origin}/api/content/share/${slug}/`
        );
        toast.error("Share link copied!");
      })
      .catch(() => toast.error("Failed to share post"));
  };
  if (message && posts.length === 0) return <div>{message}</div>;
  if (posts.length === 0) return <div>No posts available.</div>;
  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>

      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            marginBottom: 20,
            borderBottom: "1px solid #ddd",
            paddingBottom: 10,
          }}
        >
          <div className="feed-author">
            <strong>{post.author_username || "Unknown"}</strong>
          </div>
          <div className="feed-media">
            <Media src={post.media_url || ""} />
          </div>
          <div style={{ marginTop: 10 }}>{post.caption}</div>
          <div>Themes: {post.themes.filter(Boolean).join(", ")}</div>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => handleLike(post)}>
              {post.liked ? "Unlike" : "Like"} ({post.likes_count})
            </button>

            <button onClick={() => handleSave(post)} style={{ marginLeft: 10 }}>
              {post.saved ? "Unsave" : "Save"} ({post.saves_count})
            </button>

            <button onClick={() => handleShare(post)} style={{ marginLeft: 10 }}>
              Share
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem(
                "comment"
              ) as HTMLInputElement;
              handleComment(post, input.value);
              input.value = "";
            }}
            style={{ marginTop: 10 }}
          >
            <input
              type="text"
              name="comment"
              placeholder="Write a comment"
              style={{ width: "70%", marginRight: 10 }}
            />
            <button type="submit">Comment</button>
          </form>
        </div>
      ))}

      {feedType === "upload" && hasMore && (
        <button onClick={() => fetchFeed(offset)} disabled={loading}>
          {loading ? "Loading…" : "Load More"}
        </button>
      )}
    </div>
  );
};

export default Feed;
