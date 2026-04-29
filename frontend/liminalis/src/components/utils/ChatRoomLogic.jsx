import { useState, useEffect, useRef, useCallback } from "react";
import AxiosConfig from "../../config/AxiosConfig";

export const useChatRoom = (chatId, token) => {
  // Stores chat metadata (participants, title, etc.)
  const [chat, setChat] = useState(null);
  // Stores list of messages in the current chat
  const [messages, setMessages] = useState([]);
  // Tracks last message marked as read
  const [lastReadId, setLastReadId] = useState(null);
  // WebSocket connection readiness state
  const [wsReady, setWsReady] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    AxiosConfig.get(`/chats/${chatId}`)
      .then(({ data }) => setChat(data.data))
      .catch(console.error);
  }, [chatId]);

  /**
   * FETCH INITIAL MESSAGES
   * Load last 20 messages nd last read message
   */
  useEffect(() => {
    AxiosConfig.get(`/chats/${chatId}/messages?limit=20`)
      .then(({ data }) => {
        setMessages(Array.isArray(data?.data?.messages) ? data.data.messages : []);
        setLastReadId(data?.data?.last_read_message_id ?? null);
      })
      .catch(console.error);
  }, [chatId]);

  useEffect(() => {
    if (!token || !chatId) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`
    );

    ws.current = socket;

    /**
       * CONNECTION OPEN
       * Join the chat room
     */
    socket.onopen = () => {
      setWsReady(true);
      socket.send(JSON.stringify({ type: "join", chat_id: Number(chatId) }));
    };

    /**
       * INCOMING MESSAGES
       * Handles:
       * - new messages
       * - deleted messages
     */
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "delete_message") {
        setMessages((prev) =>
          prev.filter((m) => Number(m.id) !== Number(data.id))
        );
      } else if (data.type === "message") {
        setMessages((prev) =>
          prev.some((m) => Number(m.id) === Number(data.id)) ? prev : [...prev, data]
        );
      }
    };

    socket.onclose = () => setWsReady(false);

    return () => socket.close();
  }, [chatId, token]);

  // Handles sent mesages
  const sendMessage = (content) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "message",
          chat_id: Number(chatId),
          content,
        })
      );
    }
  };
  // Handles deleted messages
  const deleteMessage = (messageId) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "delete_message",
          chat_id: Number(chatId),
          message_id: Number(messageId),
        })
      );
    }
  };

  /**
     * MARK MESSAGE AS READ (HTTP REQUEST)
     * - Updates backend read status
     * - Updates local state
     * TODO: Fix it and refactor so it works properly when a user has more than 1 chat
   */
  const markAsRead = useCallback(
    async (messageId) => {
      if (!chatId || !messageId) return;

      try {
        const { data } = await AxiosConfig.post(`/chats/${chatId}/read`, {
          message_id: Number(messageId),
        });

        const newLast = data?.last_read_message_id ?? Number(messageId);
        setLastReadId(newLast);
        return newLast;
      } catch (err) {
        console.error(err);
      }
    },
    [chatId]
  );

  return {
    chat,
    messages,
    setMessages,
    lastReadId,
    markAsRead,
    wsReady,
    sendMessage,
    deleteMessage,
  };
};