import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  
  // Refs for scroll management
  const feedWrapperRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const isScrollingRef = useRef(false);
  const lastScrollTime = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null); // Sentinel for infinite scroll

  const PAGE_SIZE = 5; // Only used for upload feed

  // Fetch feed logic
  const fetchFeed = useCallback(async (offsetValue?: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // Only show loader for initial load
    if ((feedType === 'upload' && (offsetValue ?? offset) === 0) || (feedType !== 'upload' && posts.length === 0)) {
      showLoader();
    }
    try {
      if (feedType === "upload") {
        const data = await getUploadFeed(offsetValue ?? offset, PAGE_SIZE);
        const newPosts = data.posts;
        setPosts((prev) => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map((p: Post) => p.id));
          const uniqueNewPosts = newPosts.filter((p: Post) => !existingIds.has(p.id));
          return (offsetValue ?? offset) === 0 ? newPosts : [...prev, ...uniqueNewPosts];
        });
        setOffset((offsetValue ?? offset) + PAGE_SIZE);
        setHasMore(newPosts.length === PAGE_SIZE);
      } else {
        const data = await getFeed(feedType);
        if ("detail" in data) {
          setMessage(data.detail);
          setHasMore(false);
        } else {
          const singlePost = data as Post;
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p: Post) => p.id));
            if (existingIds.has(singlePost.id)) return prev;
            return [...prev, singlePost];
          });
          setHasMore(true); // Always allow fetching more for getFeed
        }
      }
    } catch (error) {
      toast.error("Failed to load feed");
      console.error("Feed fetch error:", error);
    } finally {
      setIsLoading(false);
      if ((feedType === 'upload' && (offsetValue ?? offset) === 0) || (feedType !== 'upload' && posts.length === 0)) {
        hideLoader();
      }
    }
  }, [feedType, offset, isLoading, hasMore, showLoader, hideLoader, posts.length]);

  useEffect(() => {
    // Reset state when feedType changes
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    setMessage("");
    setCurrentPostIndex(0);
    setIsLoading(false);
    postRefs.current = {};
    
    // Initial load
    fetchFeed(0);
  }, [feedType]);

  // Infinite scroll using sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isLoading) {
            fetchFeed();
          }
        });
      },
      {
        root: feedWrapperRef.current,
        threshold: 0.1,
      }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, fetchFeed]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postElement = entry.target as HTMLElement;
            const postIndex = parseInt(postElement.dataset.postIndex || "0");
            setCurrentPostIndex(postIndex);
            
            // Load more posts when approaching the end
            if (postIndex >= posts.length - 2 && hasMore && !isLoading) {
              fetchFeed(offset);
            }
          }
        });
      },
      {
        root: feedWrapperRef.current,
        threshold: 0.5,
        rootMargin: "0px 0px -20% 0px"
      }
    );

    // Observe all post elements
    Object.values(postRefs.current).forEach(postRef => {
      if (postRef) observer.observe(postRef);
    });

    return () => observer.disconnect();
  }, [posts, hasMore, isLoading, offset]);

  // Smooth scroll management
  const handleScroll = useCallback(() => {
    if (!feedWrapperRef.current) return;
    
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return; // Throttle scroll events
    lastScrollTime.current = now;

    if (isScrollingRef.current) return;
    
    const wrapper = feedWrapperRef.current;
    const scrollTop = wrapper.scrollTop;
    const postHeight = wrapper.clientHeight;
    const newIndex = Math.round(scrollTop / postHeight);
    
    if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentPostIndex(newIndex);
    }
  }, [currentPostIndex, posts.length]);

  useEffect(() => {
    const wrapper = feedWrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener('scroll', handleScroll, { passive: true });
    return () => wrapper.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLike = useCallback((post: Post) => {
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
  }, []);

  const handleSave = useCallback((post: Post) => {
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
  }, []);

  const handleComment = useCallback((post: Post, text: string) => {
    if (!text.trim()) return;
    commentPost(post.id, text)
      .then(() => {
        toast.success("Comment posted");
      })
      .catch(() => toast.error("Failed to post comment"));
  }, []);

  const handleShare = useCallback((post: Post) => {
    sharePost(post.id)
      .then(({ slug }) => {
        navigator.clipboard.writeText(
          `${window.location.origin}/api/content/share/${slug}/`
        );
        toast.success("Share link copied!");
      })
      .catch(() => toast.error("Failed to share post"));
  }, []);

  if (message && posts.length === 0) 
    return <div className="feed-message-container">{message}</div>;
  
  if (posts.length === 0) 
    return <div className="feed-empty-state">No posts available.</div>;

  return (
    <div className="feed-container">
      <div 
        className="feed-wrapper" 
        ref={feedWrapperRef}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="feed-post"
            ref={(el) => {
              if (el) postRefs.current[post.id] = el;
            }}
            data-post-index={index}
          >
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
                      {post.themes.filter(Boolean).map((theme, themeIndex) => (
                        <span key={themeIndex} className="feed-theme-tag">
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
        
        {/* Loading Indicator */}
        {isLoading && posts.length > 0 && (
          <div className="feed-loading-container">
            <div className="feed-loading-spinner">
              <div className="feed-spinner"></div>
            </div>
          </div>
        )}
        
        {/* End of Feed Indicator */}
        {!hasMore && posts.length > 0 && (
          <div className="feed-end-indicator">
            <p className="feed-end-text">You've reached the end!</p>
          </div>
        )}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </div>
  );
};

export default Feed;