import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';
import PreviewPanel from '../components/editor/PreviewPanel';
import LikeButton from '../components/LikeButton';
import './styles/PostView.css';

const PostView = () => {
  // Get post ID from URL params
  const { id } = useParams();

  // Translation + current language
  const { t, i18n } = useTranslation();

  // State for post data, loading and error handling
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post when component mounts or ID changes
  useEffect(() => {
    const fetchPost = async () => {
      try {
        // API call to get post data
        const response = await AxiosConfig.get(`/posts/${id}`);
        setPostData(response.data);
      } catch (err) {
        // Handle specific "not found" error vs generic error
        const msg =
          err.response?.data?.messages?.error === "Post not found"
            ? t('post_view.error_not_found')
            : t('post_view.error_generic');

        setError(msg);
      } finally {
        // Stop loading state
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, t]);

  // Show loading state
  if (loading) return <div className="loading">{t('post_view.loading')}</div>;

  // Show error state
  if (error) return <div className="error-message">{error}</div>;

  // Destructure API response
  const { post, content, images } = postData;

  // Enrich content blocks with actual image URLs
  const enrichedBlocks = content.blocks.map(block => {
    if (block.type === 'image') {
      // Match block token with image metadata from backend
      const imgDetail = images.find(img => img.token === block.token);

      return {
        ...block,
        // Build full image URL or fallback to null
        src: imgDetail
          ? `${process.env.REACT_APP_API_URL}/${imgDetail.url}`
          : null
      };
    }
    return block;
  });

  // Rebuild full document with enriched blocks
  const enrichedDoc = { ...content, blocks: enrichedBlocks };

  // Format post creation date based on current language
  const formattedDate = new Date(post.created_at).toLocaleDateString(i18n.language);

  // Resolve avatar URL or fallback to default image
  const avatarUrl = post.avatar
    ? `${process.env.REACT_APP_API_URL}/${post.avatar}`
    : '/default-avatar.png';

  return (
    <article className="full-post-container">
      {/* Post header section */}
      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>

        <div className="post-author-meta">
          {/* Author info with link to profile */}
          <Link to={`/profile/${post.user_slug}`} className="author-info">
            <img
              src={avatarUrl}
              alt={post.username}
              className="author-mini-icon"
            />
            <span className="author-nickname">@{post.username}</span>
          </Link>

          {/* Separator */}
          <span className="meta-separator">•</span>

          {/* Post date */}
          <div className="post-date">
            {t('post_view.published_on', { date: formattedDate })}
          </div>
        </div>
      </header>

      {/* Post content */}
      <main className="post-body">
        {/* PreviewPanel renders structured editor content in read-only mode */}
        <PreviewPanel mode="viewer" doc={enrichedDoc} />
      </main>

      {/* Post footer */}
      <footer className="post-footer">
        {/* Like button component */}
        <LikeButton postId={post.id} />
      </footer>
    </article>
  );
};

export default PostView;