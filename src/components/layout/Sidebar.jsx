import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({
  theme,
  onToggleTheme,
  history,
  folders,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onShareChat,
  onMoveChatToFolder,
  exampleQueries,
  onExampleClick,
  user,
  onLoginClick,
  onLogout,
  isOpen,
  onClose,
  onSettingsClick,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = (e, chatId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Header logic relocated to global Floating Header */}

      <button className="new-chat-btn" onClick={() => { onNewChat(); onClose(); }}>
        <span className="plus">+</span> New Chat
      </button>

      <div className="sidebar-nav">
        <NavLink to="/dossiers" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onClose}>
          <span className="nav-icon">💼</span> My Dossiers
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onClose}>
          <span className="nav-icon">📊</span> Analytics
        </NavLink>
      </div>

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
                    <span className="chat-title">{chat.title || "New Chat"}</span>
                  </button>
                  
                  <div className="chat-item-actions">
                    <button 
                      className={`menu-dots-btn ${openMenuId === chat.id ? "active" : ""}`}
                      onClick={(e) => handleMenuToggle(e, chat.id)}
                      title="Menu"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>

                    {openMenuId === chat.id && (
                      <div className="chat-menu-dropdown" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        <button className="menu-action-item" onClick={() => { onShareChat?.(chat.id); setOpenMenuId(null); }}>
                          <span className="menu-item-icon">🔗</span> Share Chat
                        </button>
                        
                        <div className="menu-move-section">
                           <span className="move-label">Move to Dossier:</span>
                           <select 
                            className="move-folder-select-refined"
                            value={chat.folderId || "general"}
                            onChange={(e) => {
                              onMoveChatToFolder(chat.id, e.target.value);
                              setOpenMenuId(null);
                            }}
                          >
                            <option value="general">📁 General</option>
                            {folders.map(f => (
                              <option key={f.id} value={f.id}>📁 {f.name}</option>
                            ))}
                          </select>
                        </div>

                        <button className="menu-action-item delete" onClick={() => { onDeleteChat(chat.id); setOpenMenuId(null); }}>
                          <span className="menu-item-icon">🗑️</span> Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
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
          <button className="settings-trigger-btn" onClick={onSettingsClick}>
            <span className="settings-icon">⚙️</span> Settings
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Built for Hackathon 2026</span>
        </div>
      </div>
    </aside>
  );
}
