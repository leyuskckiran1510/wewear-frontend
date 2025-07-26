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
        toast.success("Comment posted");
      })
      .catch(() => toast.error("Failed to post comment"));
  };

  const handleShare = (post: Post) => {
    sharePost(post.id)
      .then(({ slug }) => {
        navigator.clipboard.writeText(
          `${window.location.origin}/api/content/share/${slug}/`
        );
        toast.success("Share link copied!");
      })
      .catch(() => toast.error("Failed to share post"));
  };

  if (message && posts.length === 0) 
    return <div className="feed-message-container">{message}</div>;
  
  if (posts.length === 0) 
    return <div className="feed-empty-state">No posts available.</div>;

  return (
    <div className="feed-container">
      <div className="feed-wrapper">
        {posts.map((post) => (
          <div key={post.id} className="feed-post">
            <div className="feed-post-inner">
              {/* Media Container */}
              <div className="feed-media-container">
                <div className="feed-media">
                  <Media src={post.media_url || ""} />
                </div>
                
                {/* Media Overlay Content */}
                <div className="feed-overlay">
                  {/* Author Info - Left Bottom */}
                  <div className="feed-content-left">
                    <div className="feed-author">
                      <div className="feed-author-avatar">
                        <span className="feed-author-initial">
                          {(post.author_username || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="feed-author-info">
                        <h3 className="feed-author-username">
                          @{post.author_username || "unknown"}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Caption */}
                    <div className="feed-caption">
                      <p className="feed-caption-text">{post.caption}</p>
                    </div>
                    
                    {/* Themes */}
                    <div className="feed-themes">
                      {post.themes.filter(Boolean).map((theme, index) => (
                        <span key={index} className="feed-theme-tag">
                          #{theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons - Right Side */}
                  <div className="feed-actions">
                    <div className="feed-actions-container">
                      {/* Like Button */}
                      <div className="feed-action-item">
                        <button
                          className={`feed-action-btn feed-like-btn ${
                            post.liked ? "feed-action-active" : ""
                          }`}
                          onClick={() => handleLike(post)}
                        >
                          <svg className="feed-action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                        <span className="feed-action-count">{post.likes_count}</span>
                      </div>
                      
                      {/* Comment Button */}
                      <div className="feed-action-item">
                        <button className="feed-action-btn feed-comment-btn">
                          <svg className="feed-action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21,6C21,4.89 20.1,4 19,4H5A2,2 0 0,0 3,6V16A2,2 0 0,0 5,18H18L21,21V6Z"/>
                          </svg>
                        </button>
                        <span className="feed-action-count">{post.comments_count || 0}</span>
                      </div>
                      
                      {/* Save Button */}
                      <div className="feed-action-item">
                        <button
                          className={`feed-action-btn feed-save-btn ${
                            post.saved ? "feed-action-active" : ""
                          }`}
                          onClick={() => handleSave(post)}
                        >
                          <svg className="feed-action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5,2V22L12,18L19,22V2H5Z"/>
                          </svg>
                        </button>
                        <span className="feed-action-count">{post.saves_count}</span>
                      </div>
                      
                      {/* Share Button */}
                      <div className="feed-action-item">
                        <button
                          className="feed-action-btn feed-share-btn"
                          onClick={() => handleShare(post)}
                        >
                          <svg className="feed-action-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19C20.92,17.39 19.61,16.08 18,16.08M18,4A1,1 0 0,1 19,5A1,1 0 0,1 18,6A1,1 0 0,1 17,5A1,1 0 0,1 18,4M6,13A1,1 0 0,1 7,12A1,1 0 0,1 6,11A1,1 0 0,1 5,12A1,1 0 0,1 6,13M18,20C17.45,20 17,19.55 17,19C17,18.45 17.45,18 18,18C18.55,18 19,18.45 19,19C19,19.55 18.55,20 18,20Z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comment Input - Hidden by default, can be toggled */}
              <div className="feed-comment-section">
                <form
                  className="feed-comment-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem("comment") as HTMLInputElement;
                    handleComment(post, input.value);
                    input.value = "";
                  }}
                >
                  <input
                    type="text"
                    name="comment"
                    className="feed-comment-input"
                    placeholder="Add a comment..."
                  />
                  <button type="submit" className="feed-comment-submit">
                    <svg className="feed-comment-submit-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        
        {/* Load More Button */}
        {feedType === "upload" && hasMore && (
          <div className="feed-load-more-container">
            <button 
              className="feed-load-more-btn" 
              onClick={() => fetchFeed(offset)}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;