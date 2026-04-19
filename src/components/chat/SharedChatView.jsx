import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { parseMarkdown } from "../../utils/markdown";
import exportPdf from "../../utils/exportPdf";
import "./SharedChatView.css";

export default function SharedChatView({ getToken, user }) {
  const { shareId } = useParams();
  const [chat, setChat] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setError("You need to be signed in to view this shared chat.");
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await fetch(`/api/share/${shareId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Access denied.");
        setChat(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareId, user, getToken]);

  const handleExport = () => {
    if (!chat) return;
    exportPdf(null, null, chat.messages, chat.title);
  };

  if (loading) {
    return (
      <div className="shared-view-state">
        <div className="shared-spinner">⚖</div>
        <p>Loading shared chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-view-state error">
        <div className="shared-error-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>{error}</p>
        <Link to="/" className="shared-home-link">← Back to NyayBot</Link>
      </div>
    );
  }

  return (
    <div className="shared-view">
      <div className="shared-header">
        <div className="shared-header-left">
          <span className="shared-logo">⚖️</span>
          <div>
            <h1 className="shared-title">{chat.title}</h1>
            <p className="shared-meta">Shared by {chat.ownerName} · {new Date(chat.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>
        <div className="shared-header-actions">
          <button className="shared-export-btn" onClick={handleExport}>📄 Export PDF</button>
          <Link to="/" className="shared-home-btn">Open NyayBot</Link>
        </div>
      </div>

      <div className="shared-chat-body">
        <div className="shared-readonly-badge">👁 Read-only · Shared Chat</div>
        {chat.messages.map((msg, i) => (
          <div key={i} className={`shared-message ${msg.role}`}>
            {msg.role === "assistant" && <div className="shared-bot-avatar">⚖</div>}
            <div className="shared-bubble">
              {msg.role === "assistant" ? (
                <div className="md-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && <div className="shared-user-avatar">You</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
