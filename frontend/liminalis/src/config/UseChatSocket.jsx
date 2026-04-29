import { useEffect, useRef, useState } from "react";

export default function useChatSocket(token, chatId) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!token) return;

    ws.current = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    ws.current.onopen = () => {
      console.log("Connected");

      ws.current.send(
        JSON.stringify({
          type: "join",
          chat_id: chatId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.current.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [token, chatId]);

  const sendMessage = (content) => {
    ws.current?.send(
      JSON.stringify({
        type: "message",
        chat_id: chatId,
        content,
      })
    );
  };

  return { messages, sendMessage };
}