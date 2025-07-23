import React, { useEffect, useState } from "react";
import { getForYouFeed } from "../services/feedService";
import { Post } from "../services/types";

const FeedForYou = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getForYouFeed()
      .then(setPosts)
      .catch(() => setError("Failed to load feed"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading feed...</div>;
  if (error) return <div>{error}</div>;
  if (posts.length === 0) return <div>No posts yet.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", paddingTop: 30 }}>
      <h2>For You Feed</h2>
      { posts?.detail?<div>{posts?.detail}</div>: posts.map((post) => (
        <div key={post.id} style={{ marginBottom: 20, borderBottom: "1px solid #ddd", paddingBottom: 10 }}>
          <div><strong>{post.author_username || "Unknown"}</strong></div>
          {post.media_url && <img src={post.media_url} alt="" style={{ maxWidth: "100%" }} />}
          <div>{post.caption}</div>
          <div>Likes: {post.likes_count} Comments: {post.comments_count}</div>
        </div>
      ))}
    </div>
  );
};

export default FeedForYou;
