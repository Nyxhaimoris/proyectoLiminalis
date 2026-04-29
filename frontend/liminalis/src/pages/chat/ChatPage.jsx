import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import AxiosConfig from "../../config/AxiosConfig";
import { useChatRoom } from "../../components/utils/ChatRoomLogic";
import useCursorInfiniteScroll from "../../components/utils/ReverseInfiniteScroller";
import ChatHeader from "../../components/chats/ChatHeader";
import MessageList from "../../components/chats/MessageList";
import ChatInput from "../../components/chats/ChatInput";
import ContextMenu from "../../components/chats/ContextMenu";

import "./styles/ChatPage.css";

const ChatPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const token = localStorage.getItem("access_token");

  const userId = useMemo(() => {
    try {
      const decoded = token ? jwtDecode(token) : null;
      return decoded?.uid || null;
    } catch {
      return null;
    }
  }, [token]);

  const [chatState, setChatState] = useState("loading");
  const [chat, setChat] = useState(null);

  const {
    messages,
    setMessages,
    lastReadId,
    markAsRead,
    wsReady,
    sendMessage,
    deleteMessage,
  } = useChatRoom(id, token);

  const { containerRef, topSentinelRef } = useCursorInfiniteScroll(
    id,
    messages,
    setMessages,
    true,
    () => {}
  );

  const [menuConfig, setMenuConfig] = useState(null);
  const lastMarkedRef = useRef(null);

  useEffect(() => {
    AxiosConfig.get(`/chats/${id}`)
      .then((res) => {
        const data = res.data.data;

        if (!data?.is_member) {
          setChatState("blocked");
          return;
        }

        setChat(data);
        setChatState("member");
      })
      .catch(() => {
        setChatState("blocked");
      });
  }, [id]);

  if (chatState === "loading") {
    return <div className="chat-loading">{t("chat_page.loading")}</div>;
  }

  if (chatState === "blocked") {
    return (
      <div className="chat-blocked">
        <h2>{t("chat_page.no_access")}</h2>
      </div>
    );
  }

  const handleOpenMenu = (x, y, messageId, content, canDelete) => {
    setMenuConfig({ x, y, messageId, content, canDelete });
  };

  const confirmDelete = () => {
    if (menuConfig) {
      try {
        deleteMessage(menuConfig.messageId);
      } catch (err) {
        console.error(err);
        alert(t("chat_page.errors.delete"));
      }
      setMenuConfig(null);
    }
  };

  return (
    <div className="chat-page">
      <ChatHeader chatName={chat?.name} id={id} wsReady={wsReady} />

      <MessageList
        messages={messages}
        userId={userId}
        containerRef={containerRef}
        topSentinelRef={topSentinelRef}
        onDeleteRequest={handleOpenMenu}
        chatRole={chat?.my_role}
        lastReadId={lastReadId}
      />

      <ChatInput onSendMessage={sendMessage} disabled={!wsReady} />

      {menuConfig && (
        <ContextMenu
          x={menuConfig.x}
          y={menuConfig.y}
          content={menuConfig.content}
          onDelete={confirmDelete}
          onClose={() => setMenuConfig(null)}
          canDelete={menuConfig.canDelete}
        />
      )}
    </div>
  );
};

export default ChatPage;