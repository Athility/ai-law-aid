import "./Sidebar.css";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({
  theme,
  onToggleTheme,
  history,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  exampleQueries,
  onExampleClick,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">⚖</span>
          <div>
            <h1>NyayBot</h1>
            <p>AI Legal Aid for India</p>
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Chat
      </button>

      {history.length > 0 && (
        <div className="sidebar-section history-section">
          <p className="section-label">Recent Chats</p>
          <div className="history-list">
            {history.map((chat) => (
              <div
                key={chat.id}
                className={`history-item ${chat.id === activeChatId ? "active" : ""}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="history-title">{chat.title}</span>
                <button
                  className="history-delete"
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <p className="section-label">Quick examples</p>
        {exampleQueries.map((q, i) => (
          <button key={i} className="example-btn" onClick={() => onExampleClick(q.text)}>
            <span>{q.icon}</span>
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="disclaimer-box">
          <p>⚠ For general information only. Not a substitute for a licensed lawyer.</p>
        </div>
        <p className="made-with">Built for Hackathon 2026</p>
      </div>
    </aside>
  );
}
