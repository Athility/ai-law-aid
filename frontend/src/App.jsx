import { useState, useRef, useEffect } from "react";
import "./App.css";

const EXAMPLE_QUERIES = [
  { icon: "🏠", label: "Landlord won't return deposit", text: "My landlord is refusing to return my security deposit of ₹50,000 even after I vacated the flat 2 months ago." },
  { icon: "🛒", label: "Online shopping fraud", text: "I was cheated while buying a phone online. I paid ₹15,000 but received a fake product and the seller is not responding." },
  { icon: "💼", label: "Salary not paid", text: "My employer has not paid my salary for the last 3 months. They keep giving excuses and I don't know what to do." },
  { icon: "👨‍👩‍👧", label: "Domestic violence", text: "I am facing domestic violence from my husband and his family. What legal protections do I have?" },
  { icon: "🌐", label: "Cybercrime / online fraud", text: "Someone hacked my social media and is posting fake content in my name. What can I do legally?" },
  { icon: "🏗️", label: "Builder not giving possession", text: "My builder is delaying possession of my flat for 2 years beyond the promised date. Can I get compensation?" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setStarted(true);

    const userMsg = { role: "user", content: userText };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      setMessages([...newHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚖</span>
          <div>
            <h1>NyayBot</h1>
            <p>AI Legal Aid for India</p>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">Quick examples</p>
          {EXAMPLE_QUERIES.map((q, i) => (
            <button key={i} className="example-btn" onClick={() => { setStarted(true); sendMessage(q.text); }}>
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

      {/* Main */}
      <main className="main">
        {!started ? (
          <div className="landing">
            <div className="landing-badge">Free · No sign-up · Indian Law</div>
            <h2 className="landing-title">Understand your<br /><span>legal rights</span><br />in plain language</h2>
            <p className="landing-sub">Describe your problem in English or Hindi — get instant guidance on Indian laws, your rights, and next steps.</p>
            <div className="landing-grid">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button key={i} className="landing-card" onClick={() => sendMessage(q.text)}>
                  <span className="card-icon">{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-area">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                {m.role === "assistant" && <div className="bot-avatar">⚖</div>}
                <div className="bubble">
                  {m.content.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < m.content.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
                {m.role === "user" && <div className="user-avatar">You</div>}
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="bot-avatar">⚖</div>
                <div className="bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe your legal problem in English or Hindi..."
            rows={1}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          </button>
        </div>
      </main>
    </div>
  );
}
