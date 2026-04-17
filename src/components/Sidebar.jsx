import "./Sidebar.css";

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
  user,
  onLoginClick,
  onLogout,
  isOpen,
  onClose,
}) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Header logic relocated to global Floating Header */}

      <button className="new-chat-btn" onClick={() => { onNewChat(); onClose(); }}>
        <span className="plus">+</span> New Chat
      </button>

      <div className="sidebar-scroll">
        <div className="section">
          <h3 className="section-title">RECENT CHATS</h3>
          <div className="chat-list">
            {history.length === 0 ? (
              <p className="empty-state">No history yet</p>
            ) : (
              history.map((chat) => (
                <div key={chat.id} className={`chat-item-wrapper ${chat.id === activeChatId ? "active" : ""}`}>
                  <button
                    className="chat-item"
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <span className="chat-icon">💬</span>
                    <span className="chat-title">{chat.title || "New Chat"}</span>
                  </button>
                  <button className="delete-chat" onClick={() => onDeleteChat(chat.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">QUICK EXAMPLES</h3>
          <div className="example-list">
            {exampleQueries.map((q, i) => (
              <button
                key={i}
                className="example-item"
                onClick={() => { onExampleClick(q.text); onClose(); }}
              >
                <span className="example-icon">{q.icon}</span>
                <span className="example-label">{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        {user ? (
          <div className="user-profile">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="user-avatar-img" />
            ) : (
              <div className="user-avatar">{user.name?.[0] || "U"}</div>
            )}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
          </div>
        ) : (
          <button className="login-trigger-btn" onClick={onLoginClick}>
            <span className="login-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <div className="login-text">
              <span className="login-title">Sign In / Sync</span>
              <span className="login-sub">Keep your chats safe</span>
            </div>
          </button>
        )}
        
        <div className="footer-links">
          <span>Built for Hackathon 2026</span>
        </div>
      </div>
    </aside>
  );
}
