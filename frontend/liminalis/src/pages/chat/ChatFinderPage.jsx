import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Axios from "../../config/AxiosConfig";
import useInfiniteScroll from "../../components/utils/InfiniteScroll";
import "./styles/ChatFinderPage.css";

const ChatFinderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data,
    setData,
    offset,
    hasMore,
    setHasMore,
    loading,
    setLoading,
    lastElementRef,
    reset,
    initialLimit
  } = useInfiniteScroll(20);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce input
  useEffect(() => {
    const tId = setTimeout(() => {
      setDebouncedQuery(query);
      reset();
    }, 300);

    return () => clearTimeout(tId);
  }, [query, reset]);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await Axios.get("/chats/public", {
        params: {
          q: debouncedQuery,
          limit: initialLimit,
          offset
        }
      });

      const newChats = res.data.data || [];

      setData(prev => {
        const ids = new Set(prev.map(c => c.id));
        const merged = [...prev];

        newChats.forEach(chat => {
          if (!ids.has(chat.id)) merged.push(chat);
        });

        return merged;
      });

      if (newChats.length < initialLimit) {
        setHasMore(false);
      }

    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQuery,
    offset,
    hasMore,
    loading,
    setData,
    setHasMore,
    setLoading,
    initialLimit,
    t
  ]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const joinChat = async (chatId) => {
    try {
      await Axios.post(`/chats/${chatId}/join`);
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error("Join failed", err);
      // toast.error(t("chat_finder.errors.join"));
    }
  };

  return (
    <div className="chat-finder-page">
      <div className="chat-finder-header">
        <input
          type="text"
          placeholder={t("chat_finder.search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chat-finder-list">
        {data.map((chat, index) => {
          const isLast = index === data.length - 1;

          return (
            <div
              key={chat.id}
              ref={isLast ? lastElementRef : null}
              className="chat-finder-item"
            >
              <div className="chat-info">
                <span className="chat-name">
                  {chat.name || t("chat_finder.unnamed")}
                </span>
                <span className="chat-meta">
                  {chat.type} {t("chat_finder.meta_separator")} {chat.visibility}
                </span>
              </div>

              <button onClick={() => joinChat(chat.id)}>
                {t("chat_finder.join")}
              </button>
            </div>
          );
        })}

        {loading && (
          <div className="chat-finder-loading">
            {t("chat_finder.loading")}
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="chat-finder-empty">
            {t("chat_finder.empty")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatFinderPage;