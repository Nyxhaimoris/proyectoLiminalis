import React, { useRef } from "react";

const MessageItem = ({ msg, isOwn, canDelete, onDeleteRequest }) => {
  const timerRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    onDeleteRequest(e.clientX, e.clientY, msg.id, msg.content, canDelete);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const { clientX, clientY } = touch;

    timerRef.current = setTimeout(() => {
      onDeleteRequest(clientX, clientY, msg.id, msg.content, canDelete);
    }, 700);
  };

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div
      className={`message ${isOwn ? "own" : "notOwn"}`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
    >
      <div className="message-info">
        <b>@{msg.user_name}</b>
      </div>
      <span className="message-content">{msg.content}</span>
    </div>
  );
};

export default MessageItem;