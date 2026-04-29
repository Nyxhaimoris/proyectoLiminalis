import { useState } from "react";

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-input">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Message..."
      />
      <button onClick={handleSend} disabled={disabled} className="send-button">
        Send
      </button>
    </div>
  );
};

export default ChatInput;