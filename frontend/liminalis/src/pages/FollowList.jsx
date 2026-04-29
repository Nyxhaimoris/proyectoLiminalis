import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';
import useInfiniteScroll from '../components/utils/InfiniteScroll';
import './styles/FollowList.css';

const FollowList = ({ type }) => {
    // Get profile slug from URL (e.g., /profile/:slug/followers)
    const { slug } = useParams();

    // Navigation hook for redirecting to user profiles
    const navigate = useNavigate();

    // Translation function
    const { t } = useTranslation();

    // Base API URL (used for avatars)
    const API_URL = process.env.REACT_APP_API_URL;

    // State for handling private profiles and errors
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState(null);

    // Track already loaded users to prevent duplicates
    const seenUsersRef = useRef(new Set());

    // Prevent multiple simultaneous API calls
    const isFetchingRef = useRef(false);

    // Custom infinite scroll hook
    const {
        data: list,            // List of users
        setData,               // Function to update list
        offset,                // Pagination offset
        loading,               // Loading state
        setLoading,            // Setter for loading
        lastElementRef,        // Ref for last element (for intersection observer)
        reset,                 // Reset pagination
        setHasMore             // Control if more data can be loaded
    } = useInfiniteScroll([], 20);

    // Reset state when slug or type (followers/following) changes
    useEffect(() => {
        if (!slug || !type) return;

        seenUsersRef.current.clear(); // Clear deduplication set
        setData([]);                 // Clear current list
        reset();                     // Reset pagination
        setHasMore(true);            // Assume more data is available
        setError(null);              // Clear errors
        setIsPrivate(false);         // Reset private flag
        isFetchingRef.current = false;
    }, [slug, type]);

    // Deduplicate users before adding to list
    const addUsersSafely = useCallback((newUsers) => {
        const uniqueUsers = [];

        newUsers.forEach(user => {
            // Identify user uniquely (slug > username > id)
            const userId = user.slug || user.username || user.id;

            // Add only if not already seen
            if (userId && !seenUsersRef.current.has(userId)) {
                seenUsersRef.current.add(userId);
                uniqueUsers.push(user);
            }
        });

        return uniqueUsers;
    }, []);

    // Fetch followers/following list
    const fetchList = useCallback(async () => {
        // Prevent unnecessary or duplicate requests
        if (!slug || !type || isFetchingRef.current || loading) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            // API call with pagination
            const response = await AxiosConfig.get(`/profile/${slug}/${type}`, {
                params: { offset, limit: 20 }
            });

            // Validate response format
            if (response.data?.data && Array.isArray(response.data.data)) {
                // Remove duplicates
                const deduped = addUsersSafely(response.data.data);

                // Append new users to list
                if (deduped.length > 0) {
                    setData(prev => [...prev, ...deduped]);
                }

                // Determine if more data is available
                setHasMore(response.data.hasMore ?? deduped.length === 20);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            const status = err.response?.status;

            // Handle private profile case
            if (status === 403) {
                setIsPrivate(true);
                setData([]);
                setHasMore(false);
                return;
            }

            // Handle general errors
            setError(
                err.response?.data?.message ||
                err.message ||
                t('follow_list.error_load')
            );

            setHasMore(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [slug, type, loading, offset]);

    // Trigger fetch when offset, slug, or type changes
    useEffect(() => {
        if (!slug || !type) return;
        fetchList();
    }, [offset, slug, type]);

    // Helper to truncate long user descriptions
    const truncateDescription = (text) => {
        if (!text) return "";
        return text.length > 60 ? text.substring(0, 60) + "..." : text;
    };

    // IMPORTANT: Handle private profile BEFORE rendering anything else
    if (isPrivate) {
        return (
            <div className="follow-list-page">
                <h2 className="follow-list-title">
                    {type === 'followers'
                        ? t('follow_list.followers')
                        : t('follow_list.following')}
                </h2>

                {/* Message shown when profile is private */}
                <p className="follow-list-private">
                    {t('follow_list.private')}
                </p>
            </div>
        );
    }

    return (
        <div className="follow-list-page">
            {/* Page title */}
            <h2 className="follow-list-title">
                {type === 'followers'
                    ? t('follow_list.followers')
                    : t('follow_list.following')}
            </h2>

            {/* Empty state */}
            {list.length === 0 && !loading ? (
                <p className="follow-list-empty">
                    {t('follow_list.no_users')}
                </p>
            ) : (
                <div className="follow-list-container">
                    {list.map((user, index) => {
                        // Unique key for each user
                        const userId = user.slug || user.username || `user-${index}`;

                        return (
                            <div
                                key={userId}
                                // Attach observer to last element for infinite scroll
                                ref={list.length === index + 1 ? lastElementRef : null}
                                className="follow-user-card"
                                // Navigate to user profile on click
                                onClick={() => navigate(`/profile/${user.slug}`)}
                            >
                                {/* Avatar */}
                                {user.avatar ? (
                                    <img
                                        src={`${API_URL}/${user.avatar}`}
                                        alt="avatar"
                                        className="follow-user-avatar"
                                    />
                                ) : (
                                    <div className="follow-avatar-placeholder" />
                                )}

                                {/* User info */}
                                <div className="follow-user-info">
                                    <strong>@{user.username}</strong>

                                    {/* Optional description */}
                                    {user.description && (
                                        <p className="follow-user-desc">
                                            {truncateDescription(user.description)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="follow-loading">
                    {t('follow_list.loading')}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="follow-error">
                    {error}
                </div>
            )}
        </div>
    );
};

export default FollowList;