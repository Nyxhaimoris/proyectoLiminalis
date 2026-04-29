import React, { useEffect, useState } from 'react';
import AxiosConfig from '../config/AxiosConfig';
import './styles/LikeButton.css';

const LikeButton = ({ postId }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await AxiosConfig.get(`/post/${postId}/likes`);

        setCount(res.data.likesCount ?? 0);
        setLiked(res.data.liked ?? false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLikes();
  }, [postId]);

  const toggleLike = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await AxiosConfig.post(`/posts/${postId}/toggle-like`);

      setLiked(res.data.liked);
      setCount(res.data.likesCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''}`}
      onClick={toggleLike}
      disabled={loading}
    >
      ❤️ {count}
    </button>
  );
};

export default LikeButton;