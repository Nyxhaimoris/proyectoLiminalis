import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_BASE = process.env.REACT_APP_API_URL;

const PostCard = ({ post }) => {
    const { t } = useTranslation();

    return (
        <article className="post-card">
            {post.image && (
                <div className="post-card-image">
                    <Link to={`/posts/${post.id}`}>
                        <img 
                            src={`${API_BASE}/${post.image}`} 
                            alt={t('post_card.image_alt', { title: post.title })} 
                        />
                    </Link>
                </div>
            )}
            
            <div className="post-card-content">
                <h2 className="post-card-title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h2>
                
                <p className="post-card-excerpt">
                    {post.excerpt}
                    {post.excerpt?.length >= 390 && "..."}
                </p>
                
                <div className="post-card-footer">
                    <span className="post-date">
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <Link to={`/posts/${post.id}`} className="read-more-btn">
                        {t('post_card.read_more')}
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default PostCard;