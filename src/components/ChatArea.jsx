import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatArea.css";

export default function ChatArea({ messages, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-area">
      {messages.map((m, i) => (
        <MessageBubble key={i} message={m} prevMessage={i > 0 ? messages[i - 1] : null} />
      ))}
      {loading && (
        <div className="message assistant">
          <div className="bot-avatar">⚖</div>
          <div className="bubble-wrapper">
            <div className="bubble skeleton-bubble">
              <div className="skeleton-line w100"></div>
              <div className="skeleton-line w85"></div>
              <div className="skeleton-line w60"></div>
              <div className="skeleton-line w75"></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
