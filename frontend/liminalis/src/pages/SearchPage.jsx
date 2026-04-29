import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';
import useInfiniteScroll from '../components/utils/InfiniteScroll';
import './styles/SearchPage.css';

/* LIMIT DROPDOWN COMPONENT */

const LIMIT_OPTIONS = [10, 20, 50];

const LimitDropdown = ({ limit, setLimit }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="dropdown">
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setOpen(prev => !prev)}
            >
                {limit} / page <span className="chev">▾</span>
            </button>

            {open && (
                <div className="dropdown-menu">
                    {LIMIT_OPTIONS.map((opt) => (
                        <button
                            key={opt}
                            className={`dropdown-item ${opt === limit ? 'active' : ''}`}
                            onClick={() => {
                                setLimit(opt);
                                setOpen(false);
                            }}
                        >
                            {opt} / page
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* MAIN PAGE */

const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [limit, setLimit] = useState(20);

    const API_URL = process.env.REACT_APP_API_URL;

    const {
        data: users,
        setData: setUsers,
        offset,
        hasMore,
        setHasMore,
        loading,
        setLoading,
        lastElementRef,
        reset
    } = useInfiniteScroll(limit);

    const fetchUsers = useCallback(async (isNewSearch = false) => {
        setLoading(true);

        try {
            const currentOffset = isNewSearch ? 0 : offset;

            const response = await AxiosConfig.get(`/searchUsers`, {
                params: {
                    q: searchTerm,
                    limit,
                    offset: currentOffset
                }
            });

            const newData = response.data.data;

            setUsers(prev => {
                if (isNewSearch) return newData;

                const existingIds = new Set(prev.map(u => u.id));
                const filtered = newData.filter(u => !existingIds.has(u.id));

                return [...prev, ...filtered];
            });

            setHasMore(response.data.hasMore);
        } catch (err) {
            console.error("Error searching users", err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, offset, limit, setLoading, setUsers, setHasMore]);

    useEffect(() => {
        fetchUsers();
    }, [offset]);

    useEffect(() => {
        reset();
        fetchUsers(true);
    }, [limit]);

    const handleSearch = (e) => {
        e.preventDefault();
        reset();
        fetchUsers(true);
    };

    const truncateWords = (text, wordLimit = 10) => {
        if (!text) return t('search.no_bio');
        const words = text.split(' ');
        return words.length > wordLimit
            ? words.slice(0, wordLimit).join(' ') + '...'
            : text;
    };

    return (
        <div className="search-page-container">
            <h2>{t('search.title')}</h2>

            {/* FORM */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input">
                    <input
                        type="text"
                        placeholder={t('search.placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <LimitDropdown limit={limit} setLimit={setLimit} />

                <button
                    type="submit"
                    className="search-btn"
                    disabled={loading}
                >
                    {loading ? '...' : t('search.button')}
                </button>
            </form>

            {/* USERS */}
            <div className="user-list">
                {users.map((user, index) => (
                    <div
                        key={`${user.id}-${index}`}
                        ref={
                            users.length === index + 1
                                ? (node) => lastElementRef(node, limit)
                                : null
                        }
                        className="user-row"
                    >
                        <div className="user-row-left">
                            {user.avatar ? (
                                <img
                                    src={`${API_URL}/${user.avatar}`}
                                    alt="avatar"
                                    className="search-avatar"
                                />
                            ) : (
                                <div className="avatar-placeholder-small"></div>
                            )}

                            <div className="user-info">
                                <strong>@{user.username}</strong>
                                <p className="user-bio-preview">
                                    {truncateWords(user.description)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate(`/profile/${user.slug || user.id}`)
                            }
                            className="view-profile-btn"
                        >
                            {t('search.view_profile')}
                        </button>
                    </div>
                ))}
            </div>

            {/* STATES */}
            {loading && (
                <div className="loading-spinner">
                    {t('search.loading')}
                </div>
            )}

            {!hasMore && users.length > 0 && (
                <p className="no-more-msg">
                    {t('search.no_more')}
                </p>
            )}

            {!loading && users.length === 0 && searchTerm && (
                <p className="no-more-msg">
                    {t('search.no_results')}
                </p>
            )}
        </div>
    );
};

export default SearchPage;