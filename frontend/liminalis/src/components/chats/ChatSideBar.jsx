import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import AxiosConfig from "../../config/AxiosConfig";
import "./styles/ChatSideBar.css";
import messageIcon from "../../assets/messageIcon.png";
import { useNavigate } from "react-router-dom";

const ChatSideBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // DATA
  const [chats, setChats] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(true);
  const [width, setWidth] = useState(260);

  // DRAG ICON
  const [iconPos, setIconPos] = useState({ x: 14, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(false);

  // FETCH 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatRes, inviteRes] = await Promise.all([
          AxiosConfig.get("/chats"),
          AxiosConfig.get("/chats/invitations"),
        ]);

        setChats(chatRes.data.data || []);
        setInvites(inviteRes.data.data || []);
      } catch (err) {
        console.error("Error loading chats/invites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // SIDEBAR
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setVisible(false), 250);
  };

  const handleOpen = () => {
    if (dragRef.current) return;
    setVisible(true);
    requestAnimationFrame(() => setOpen(true));
  };

  // RESIZE
  const handleMouseDown = () => {
    const onMouseMove = (e) => {
      const newWidth = e.clientX;
      if (newWidth > 160 && newWidth < 400) {
        setWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // DRAG BUTTON
  const handleIconMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = false;

    const startX = e.clientX - iconPos.x;
    const startY = e.clientY - iconPos.y;

    const onMouseMove = (moveEvent) => {
      dragRef.current = true;
      setIsDragging(true);

      let newX = moveEvent.clientX - startX;
      let newY = moveEvent.clientY - startY;

      const padding = 10;
      newX = Math.max(padding, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(padding, Math.min(newY, window.innerHeight - 60));

      setIconPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setTimeout(() => setIsDragging(false), 0);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // RENDER
  return (
    <>
      {/* SIDEBAR */}
      {visible && (
        <aside
          className={`chat-sidebar ${open ? "open" : "closed"}`}
          style={{ width }}
        >
          <button
            className="toggle-sidebar inside"
            onClick={handleClose}
            aria-label={t("chat_sidebar.close")}
          >
            ✖
          </button>

          <h3 className="chat-title">{t("chat_sidebar.title")}</h3>

          {/* NEW CHAT */}
          <button
            className="new-chat-btn"
            onClick={() => navigate("/chats/new")}
          >
            + {t("chat_sidebar.new_chat")}
          </button>

          {/* INVITATIONS */}
          {invites.length > 0 && (
            <div className="chat-invitations">
              <h4>Invitations</h4>

              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="chat-item invite"
                  onClick={() => navigate(`/chat-invite/${inv.chat_id}`)}
                >
                  {inv.name
                    ? inv.name
                    : `Invite to chat #${inv.chat_id}`}
                </div>
              ))}
            </div>
          )}

          {/* CHATS */}
          <div className="chat-list">
            {loading ? (
              <p className="chat-loading">
                {t("chat_sidebar.loading")}
              </p>
            ) : chats.length === 0 ? (
              <p className="chat-empty">
                {t("chat_sidebar.empty")}
              </p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-item"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  {chat.name}
                </div>
              ))
            )}
          </div>

          {/* RESIZER */}
          <div
            className="sidebar-resizer"
            onMouseDown={handleMouseDown}
          />
        </aside>
      )}

      {/* FLOATING BUTTON */}
      {!open && (
        <button
          className="floating-toggle"
          onMouseDown={handleIconMouseDown}
          onClick={handleOpen}
          style={{
            left: `${iconPos.x}px`,
            top: `${iconPos.y}px`,
            cursor: isDragging ? "grabbing" : "grab",
            transition: isDragging ? "none" : "all 0.25s var(--ease)",
          }}
          aria-label={t("chat_sidebar.open")}
        >
          <img
            src={messageIcon}
            alt={t("chat_sidebar.title")}
            className="chat-icon"
          />
        </button>
      )}
    </>
  );
};

export default ChatSideBar;