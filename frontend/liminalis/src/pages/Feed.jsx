import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useInfiniteScroll from '../components/utils/InfiniteScroll';
import PostCard from '../components/feed/PostCard';
import './styles/Feed.css';

// Base API URL from environment variables
const API_BASE = process.env.REACT_APP_API_URL;

const Feed = () => {
    // Translation function
    const { t } = useTranslation();

    // Feed mode: "recent" or "following"
    const [mode, setMode] = React.useState('recent');

    // Custom infinite scroll hook
    const {
        data,              // List of posts
        setData,           // Update posts
        offset,            // Pagination offset
        hasMore,           // Whether more posts are available
        loading,           // Loading state
        setLoading,        // Setter for loading
        setHasMore,        // Setter for hasMore
        lastElementRef,    // Ref for last element (intersection observer)
        initialLimit       // Number of posts per request
    } = useInfiniteScroll(8);

    // =========================
    // RESET WHEN MODE CHANGES
    // =========================
    useEffect(() => {
        // Clear existing posts when switching mode
        setData([]);

        // Reset "has more" so new mode can fetch again
        setHasMore(true);
    }, [mode]);

    useEffect(() => {
        const fetchPosts = async () => {
            // Prevent duplicate or unnecessary fetches
            if (loading || !hasMore) return;

            setLoading(true);

            try {
                // Convert offset into page number
                const page = Math.floor(offset / initialLimit);

                // Fetch posts from backend
                const response = await fetch(
                    `${API_BASE}/posts/feed?page=${page}&limit=${initialLimit}&mode=${mode}`
                );

                const result = await response.json();

                if (result.data) {
                    // Deduplicate posts by ID before adding
                    setData((prev) => {
                        const ids = new Set(prev.map(p => p.id));
                        const filtered = result.data.filter(p => !ids.has(p.id));
                        return [...prev, ...filtered];
                    });

                    // Update "has more" flag from backend
                    setHasMore(result.hasMore);
                }
            } catch (error) {
                // Log fetch errors
                console.error("Error fetching feed:", error);
            } finally {
                // Stop loading state
                setLoading(false);
            }
        };

        fetchPosts();
    }, [offset, mode]);

    return (
        <div className="feed-layout">

            {/* CENTER FEED */}
            <div className="feed-center">

                {/* Feed title */}
                <header className="feed-header">
                    <h1>{t('feed.title')}</h1>
                </header>

                {/* Posts list */}
                <div className="posts-list">
                    {data.map((post, index) => {
                        // Check if current post is the last one
                        const isLast = index === data.length - 1;

                        return (
                            <div
                                key={post.id}
                                // Attach observer to last post for infinite scroll
                                ref={isLast ? lastElementRef : null}
                            >
                                {/* Individual post card */}
                                <PostCard post={post} />
                            </div>
                        );
                    })}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="feed-loader">
                        <div className="spinner"></div>
                        <span>{t('feed.loading')}</span>
                    </div>
                )}

                {/* End of feed message */}
                {!hasMore && data.length > 0 && (
                    <div className="feed-end-message">
                        {t('feed.end')}
                    </div>
                )}

                {/* Empty state */}
                {data.length === 0 && !loading && (
                    <div className="empty-state">
                        {t('feed.empty')}
                    </div>
                )}
            </div>

            <aside className="feed-right">
                {/* Most recent mode */}
                <button
                    className={mode === 'recent' ? 'active' : ''}
                    onClick={() => setMode('recent')}
                >
                    Most recent
                </button>

                {/* Following mode */}
                <button
                    className={mode === 'following' ? 'active' : ''}
                    onClick={() => setMode('following')}
                >
                    Following
                </button>
            </aside>

        </div>
    );
};

export default Feed;