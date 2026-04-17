import { useState, useRef, useCallback, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Landing from "./components/Landing";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";
import useTheme from "./hooks/useTheme";
import useChatHistory from "./hooks/useChatHistory";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useVoiceInput from "./hooks/useVoiceInput";
import useAuth from "./hooks/useAuth";
import LoginModal from "./components/LoginModal";
import "./App.css";

const EXAMPLE_QUERIES = [
  { icon: "🏠", label: "Landlord won't return deposit", text: "My landlord is refusing to return my security deposit of ₹50,000 even after I vacated the flat 2 months ago." },
  { icon: "🛒", label: "Online shopping fraud", text: "I was cheated while buying a phone online. I paid ₹15,000 but received a fake product and the seller is not responding." },
  { icon: "💼", label: "Salary not paid", text: "My employer has not paid my salary for the last 3 months. They keep giving excuses and I don't know what to do." },
  { icon: "👨‍👩‍👧", label: "Domestic violence", text: "I am facing domestic violence from my husband and his family. What legal protections do I have?" },
  { icon: "🌐", label: "Cybercrime / online fraud", text: "Someone hacked my social media and is posting fake content in my name. What can I do legally?" },
  { icon: "🏗️", label: "Builder not giving possession", text: "My builder is delaying possession of my flat for 2 years beyond the promised date. Can I get compensation?" },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeChatId, setActiveChatId] = useState(() => generateId());
  
  // Set default sidebar open conditionally based on window width
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Auto collapse sidebar on small screens
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  }, []);

  const { theme, toggleTheme } = useTheme();
  const { user, anonId, login, logout, isAuthenticated } = useAuth();
  const { history, save, loadById, remove, refresh } = useChatHistory();

  // Voice input — append transcribed text to the input field
  const voice = useVoiceInput(
    useCallback((transcript) => {
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    }, [])
  );

  const handleNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (messages.length > 0) {
      save(activeChatId, messages, anonId);
    }
    setMessages([]);
    setStarted(false);
    setInput("");
    setAttachment(null);
    setActiveChatId(generateId());
    refresh();
  }, [messages, activeChatId, save, refresh]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setStarted(false);
    setInput("");
  }, []);

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onClearChat: handleClearChat,
    inputRef,
  });

  const handleSelectChat = useCallback((id) => {
    // Save current first
    if (messages.length > 0) {
      save(activeChatId, messages, anonId);
    }
    const chat = loadById(id);
    if (chat) {
      setMessages(chat.messages);
      setActiveChatId(chat.id);
      setStarted(true);
    }
  }, [messages, activeChatId, save, loadById]);

  const handleDeleteChat = useCallback((id) => {
    remove(id);
    if (id === activeChatId) {
      setMessages([]);
      setStarted(false);
      setActiveChatId(generateId());
    }
  }, [remove, activeChatId]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !attachment) || loading) return;
    setInput("");
    const currentAttachment = attachment;
    setAttachment(null);
    setStarted(true);
    setLoading(true);

    let content = userText;
    
    if (currentAttachment) {
      try {
        const formData = new FormData();
        formData.append("file", currentAttachment);
        const ocrRes = await fetch("/v1/vision", {
          method: "POST",
          body: formData
        });
        if (ocrRes.ok) {
          const ocrData = await ocrRes.json();
          content += `\n\n[System: Attached document text extracted via OCR: "${ocrData.extracted_text}"]`;
        } else {
          content += `\n\n[Attached File: ${currentAttachment.name}] (OCR Failed)`;
        }
      } catch (err) {
        content += `\n\n[Attached File: ${currentAttachment.name}] (OCR Server not responding)`;
      }
    }

    const userMsg = { role: "user", content: content };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      const updatedMessages = [...newHistory, { role: "assistant", content: data.reply }];
      setMessages(updatedMessages);
      // Auto-save after each response
      save(activeChatId, updatedMessages, anonId);
    } catch {
      const errorMessages = [...newHistory, { role: "assistant", content: "Something went wrong. Please try again." }];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      
      {/* Floating Anchor Header */}
      <header className="floating-header">
        <div className="header-left">
          <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>
          <div className="logo">
            <span className="logo-icon">⚖️</span>
            <div className="logo-content">
              <span className="logo-name">NyayBot</span>
              <span className="logo-tag">Legal Aid for India</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <Sidebar
        history={history}
        activeChatId={activeChatId}
        onSelectChat={(id) => { handleSelectChat(id); if (window.innerWidth <= 900) setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        exampleQueries={EXAMPLE_QUERIES}
        onExampleClick={(text) => sendMessage(text)}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">


        {!started ? (
          <Landing exampleQueries={EXAMPLE_QUERIES} onExampleClick={(text) => sendMessage(text)} />
        ) : (
          <ChatArea messages={messages} loading={loading} />
        )}
        
        <InputBar
          input={input}
          setInput={setInput}
          onSend={() => sendMessage()}
          loading={loading}
          inputRef={inputRef}
          voice={voice}
          attachment={attachment}
          setAttachment={setAttachment}
        />
      </main>

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onLogin={(userData) => { login(userData); setShowLogin(false); }} 
        />
      )}
    </div>
  );
}
