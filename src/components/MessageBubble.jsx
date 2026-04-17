import { useState } from "react";
import { parseMarkdown } from "../utils/markdown";
import exportPdf from "../utils/exportPdf";
import useVoiceOutput from "../hooks/useVoiceOutput";
import "./MessageBubble.css";

export default function MessageBubble({ message, prevMessage }) {
  const [copied, setCopied] = useState(false);
  const { isSpeaking, speak } = useVoiceOutput();
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  };

  const handleExportPdf = () => {
    const userQuestion = prevMessage?.role === "user" ? prevMessage.content : null;
    exportPdf(message.content, userQuestion);
  };

  return (
    <div className={`message ${message.role}`}>
      {isAssistant && <div className="bot-avatar">⚖</div>}
      <div className="bubble-wrapper">
        <div className="bubble">
          {isAssistant ? (
            <div
              className="md-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          ) : (
            message.content.split("\n").map((line, j) => (
              <span key={j}>
                {line}
                {j < message.content.split("\n").length - 1 && <br />}
              </span>
            ))
          )}
        </div>
        {isAssistant && (
          <div className="bubble-actions">
            <button className="action-btn" onClick={handleCopy} title={copied ? "Copied!" : "Copy to clipboard"}>
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              <span className="action-label">{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button className={`action-btn ${isSpeaking ? "active-voice" : ""}`} onClick={() => speak(message.content)} title={isSpeaking ? "Stop listening" : "Listen"}>
              {isSpeaking ? (
                <div className="voice-waves" style={{ width: "16px", height: "16px" }}>
                  <span className="wave" style={{ animationDuration: '0.4s' }} />
                  <span className="wave" style={{ animationDuration: '0.6s' }} />
                  <span className="wave" style={{ animationDuration: '0.5s' }} />
                </div>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
              <span className="action-label">{isSpeaking ? "Stop" : "Listen"}</span>
            </button>
            <button className="action-btn" onClick={handleExportPdf} title="Download as PDF">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="action-label">PDF</span>
            </button>
          </div>
        )}
      </div>
      {message.role === "user" && <div className="user-avatar">You</div>}
    </div>
  );
}
