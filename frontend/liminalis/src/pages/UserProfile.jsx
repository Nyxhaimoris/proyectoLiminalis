import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';
import PostCard from '../components/feed/PostCard';
import useInfiniteScroll from '../components/utils/InfiniteScroll';
import './styles/UserProfile.css';
import './styles/Badges.css';

const API_URL = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const [isFollowing, setIsFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    data: posts,
    setData: setPosts,
    offset,
    hasMore,
    loading,
    setLoading,
    setHasMore,
    lastElementRef,
    initialLimit
  } = useInfiniteScroll(8);

  // FIRST LOAD
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    const fetchUser = async () => {
      try {
        const res = await AxiosConfig.get(`/profile/${slug}`);
        const data = res.data.data;

        setUser(data);
        setIsFollowing(data.isFollowing);
        setIsMe(data.isMe);
        setError('');
      } catch (err) {
        console.error(err);
        setError(t('profile_view.error_loading'));
      }
    };

    fetchUser();
  }, [slug, t]); // Runs when slug or translation function changes

  const handleMessage = async () => {
    if (!user?.id) return; // prevents action if user id is missing

    try {
      const res = await AxiosConfig.post(`/chats/private/${user.id}`);
      const chatId = res.data.chat_id;

      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if (loading || !hasMore) return;

      setLoading(true);

      try {
        const page = Math.floor(offset / initialLimit);

        const res = await AxiosConfig.get(
          `/posts/user/${slug}?page=${page}&limit=${initialLimit}`
        );

        const newPosts = res.data.posts || [];

        setPosts(prev => {
          const ids = new Set(prev.map(p => p.id));
          const filtered = newPosts.filter(p => !ids.has(p.id));
          return [...prev, ...filtered];
        });

        setHasMore(newPosts.length === initialLimit);
      } catch (err) {
        console.error('Error loading posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [offset, slug]);

  // FOLLOW
  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const newState = !isFollowing;
      setIsFollowing(newState);

      setUser(prev => ({
        ...prev,
        followersCount: newState
          ? parseInt(prev.followersCount || 0) + 1
          : parseInt(prev.followersCount || 0) - 1
      }));

      const res = await AxiosConfig.post(`/profile/toggleFollow/${slug}`);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error(err);
      window.location.reload();
    }
  };

  if (!user) return <div className="profile-status">Loading...</div>;
  if (error) return <div className="profile-status error">{error}</div>;

  return (
    <div className="profile-page">
      <div className="banner-wrapper">
        {user.banner ? (
          <img src={`${API_URL}/${user.banner}`} alt="banner" />
        ) : (
          <div className="banner-fallback" />
        )}
      </div>

      <div className="profile-content">
        <div className="avatar-wrapper">
          {user.avatar ? (
            <img src={`${API_URL}/${user.avatar}`} alt="avatar" />
          ) : (
            <div className="avatar-placeholder" />
          )}
        </div>

        <div className="user-info">
          <div className="user-header-row">
            <h1>@{user.username}</h1>

            {user.isAdmin && (
              <span className="admin-badge">
                <span className="admin-text" data-text="ADMIN">
                  ADMIN
                </span>
              </span>
            )}

            {isLoggedIn && (
              isMe ? (
                <button onClick={() => navigate('/editmyprofile')}>
                  Edit profile
                </button>
              ) : (
                <span>
                  <button onClick={handleFollowToggle}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>

                  <button onClick={handleMessage}>
                    Message
                  </button>
                </span>
              )
            )}
          </div>

          {user.description && <p>{user.description}</p>}

          <div className="stats-container">
            <span
              onClick={() => navigate(`/profile/${slug}/followers`)}
              style={{ cursor: 'pointer' }}
            >
              {user.followersCount || 0} followers
            </span>

            <span
              onClick={() => navigate(`/profile/${slug}/following`)}
              style={{ cursor: 'pointer' }}
            >
              {user.followingCount || 0} following
            </span>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <h2>Posts</h2>

        {posts.length === 0 && !loading && <p>No posts yet.</p>}

        {posts.map((post, index) => {
          const isLast = index === posts.length - 1;

          return (
            <div
              key={post.id}
              ref={isLast ? lastElementRef : null}
            >
              <PostCard post={post} />
            </div>
          );
        })}

        {loading && <p>Loading more posts...</p>}
      </div>
    </div>
  );
};

export default UserProfile;