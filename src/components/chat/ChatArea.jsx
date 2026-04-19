import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatArea.css";

export default function ChatArea({ messages, loading, chatTitle, onShare, onExportFullChat }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="chat-area-wrapper">
      {hasMessages && (
        <div className="chat-header">
          <div className="chat-header-title">
            <span className="chat-header-text" title={chatTitle}>
              {chatTitle?.length > 55 ? chatTitle.slice(0, 52) + "..." : chatTitle}
            </span>
          </div>
          <div className="chat-header-actions">
            <button className="chat-header-btn" onClick={onShare} title="Share this chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>
            <button className="chat-header-btn" onClick={onExportFullChat} title="Export full chat as PDF">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Chat</span>
            </button>
          </div>
        </div>
      )}

      <div className="chat-area">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            message={m}
            prevMessage={i > 0 ? messages[i - 1] : null}
            allMessages={messages}
          />
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
    </div>
  );
}
