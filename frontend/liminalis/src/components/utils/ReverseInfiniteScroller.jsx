import { useEffect, useRef } from "react";
import AxiosConfig from "../../config/AxiosConfig";

const useCursorInfiniteScroll = (
  chatId,
  messages,
  setMessages,
  hasMore,
  setHasMore
) => {
  const containerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;

        try {
          const oldestMessage = messages[0];
          if (!oldestMessage) {
            loadingRef.current = false;
            return;
          }

          const res = await AxiosConfig.get(
            `/chats/${chatId}/messages?limit=20&before_id=${oldestMessage.id}`
          );

          const older = Array.isArray(res?.data?.data?.messages)
            ? res.data.data.messages
            : [];

          if (older.length === 0) {
            setHasMore(false);
          } else {
            // Prevent duplicates
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const filtered = older.filter((m) => !existingIds.has(m.id));

              return [...filtered, ...prev];
            });
          }
        } catch (err) {
          console.error("Infinite scroll error:", err);
        }

        loadingRef.current = false;
      },
      {
        root: containerRef.current,
        // Trigger onlyu when fully visible
        threshold: 1.0,
      }
    );

    observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [chatId, messages, hasMore, setMessages, setHasMore]);

  // Expose the refs to the component
  return {
    containerRef,
    topSentinelRef,
  };
};

export default useCursorInfiniteScroll;