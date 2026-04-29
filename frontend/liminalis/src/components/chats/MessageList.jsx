import React from "react";
import MessageItem from "./MesageItem";

const MessageList = ({
  messages,
  userId,
  containerRef,
  topSentinelRef,
  onDeleteRequest,
  chatRole,
  lastReadId,
}) => {
  return (
    <div className="messages" ref={containerRef}>
      <div ref={topSentinelRef} style={{ height: 1 }} />

      {messages.map((msg) => {
        const isLastRead = Number(msg.id) === Number(lastReadId);

        return (
          <React.Fragment key={msg.id}>
            <MessageItem
              msg={msg}
              isOwn={Number(msg.user_id ?? 0) === Number(userId ?? 0)}
              canDelete={Number(msg.user_id) === Number(userId) || chatRole === "admin"}
              onDeleteRequest={onDeleteRequest}
            />

            {isLastRead && <div className="read-marker"><span>Last read here</span></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;