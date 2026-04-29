import { useNavigate } from "react-router-dom";

const ChatHeader = ({ chatName, id, wsReady }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <div 
        className="chat-name-clickable" 
        onClick={() => navigate(`/chats/${id}/settings`)}
        style={{ cursor: 'pointer' }}
      >
        {chatName ?? "Loading..."}
      </div>
      <div>{wsReady ? "🟢 online" : "🔴 offline"}</div>
    </div>
  );
};

export default ChatHeader;