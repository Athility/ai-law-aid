import { useState } from "react";
import "./ShareModal.css";

export default function ShareModal({ chatId, messages, user, getToken, onClose }) {
  const [emailInput, setEmailInput] = useState("");
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

  const addEmail = () => {
    const clean = emailInput.trim().toLowerCase();
    if (!isValidEmail(clean)) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    if (allowedEmails.includes(clean)) {
      setError("This email is already added.");
      return;
    }
    setAllowedEmails(prev => [...prev, clean]);
    setEmailInput("");
    setError(null);
  };

  const removeEmail = (email) => {
    setAllowedEmails(prev => prev.filter(e => e !== email));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  };

  const handleCreateLink = async () => {
    if (!user) {
      setError("You must be signed in to share a chat.");
      return;
    }
    if (allowedEmails.length === 0) {
      setError("Add at least one Gmail address to share with.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const title = messages.find(m => m.role === "user")?.content?.slice(0, 60) || "Legal Chat";

      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, title, messages, allowedEmails }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create share link.");

      const link = `${window.location.origin}/shared/${data.shareId}`;
      setShareLink(link);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <h2 className="share-modal-title">Share Chat</h2>
            <p className="share-modal-sub">Only the Gmail IDs you add can access this chat.</p>
          </div>
          <button className="share-modal-close" onClick={onClose}>✕</button>
        </div>

        {!shareLink ? (
          <>
            <div className="share-email-row">
              <input
                className="share-email-input"
                type="email"
                placeholder="name@gmail.com"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
              />
              <button className="share-add-btn" onClick={addEmail}>Add</button>
            </div>

            {error && <p className="share-error">{error}</p>}

            {allowedEmails.length > 0 && (
              <div className="share-email-list">
                {allowedEmails.map(email => (
                  <div key={email} className="share-email-chip">
                    <span className="chip-icon">👤</span>
                    <span>{email}</span>
                    <button className="chip-remove" onClick={() => removeEmail(email)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="share-security-note">
              <span>🔒</span>
              <span>Only users with the link <em>and</em> an allowed Gmail can view this chat.</span>
            </div>

            <button
              className="share-create-btn"
              onClick={handleCreateLink}
              disabled={loading || allowedEmails.length === 0}
            >
              {loading ? "Creating link..." : "Generate Share Link"}
            </button>
          </>
        ) : (
          <div className="share-success">
            <div className="share-success-icon">✅</div>
            <p className="share-success-message">Share link created! Copy it and send to allowed users.</p>
            <div className="share-link-box">
              <span className="share-link-text">{shareLink}</span>
              <button className="share-copy-btn" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="share-allowed-label">Accessible by:</p>
            <div className="share-email-list">
              {allowedEmails.map(email => (
                <div key={email} className="share-email-chip">
                  <span className="chip-icon">✔</span>
                  <span>{email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
