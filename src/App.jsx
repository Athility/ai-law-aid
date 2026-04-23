import { useState, useRef, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Landing from "./components/layout/Landing";
import ChatArea from "./components/chat/ChatArea";
import InputBar from "./components/chat/InputBar";
import Dashboard from "./components/layout/Dashboard";
import useTheme from "./hooks/useTheme";
import useChatHistory from "./hooks/useChatHistory";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useVoiceInput from "./hooks/useVoiceInput";
import useAuth from "./hooks/useAuth";
import LoginModal from "./components/auth/LoginModal";
import TermsModal from "./components/auth/TermsModal";
import ShareModal from "./components/chat/ShareModal";
import SharedChatView from "./components/chat/SharedChatView";
import DossierCenter from "./components/layout/DossierCenter";
import CounselPortal from "./components/counsel/CounselPortal";
import SettingsModal from "./components/layout/SettingsModal";
import exportPdf from "./utils/exportPdf";
import "./App.css";

const EXAMPLE_QUERIES = [
  {
    icon: "🏠",
    label: "Landlord won't return deposit",
    text: "My landlord is refusing to return my security deposit of ₹50,000 even after I vacated the flat 2 months ago.",
  },
  {
    icon: "🛒",
    label: "Online shopping fraud",
    text: "I was cheated while buying a phone online. I paid ₹15,000 but received a fake product and the seller is not responding.",
  },
  {
    icon: "💼",
    label: "Salary not paid",
    text: "My employer has not paid my salary for the last 3 months. They keep giving excuses and I don't know what to do.",
  },
  {
    icon: "👨‍👩‍👧",
    label: "Domestic violence",
    text: "I am facing domestic violence from my husband and his family. What legal protections do I have?",
  },
  {
    icon: "🌐",
    label: "Cybercrime / online fraud",
    text: "Someone hacked my social media and is posting fake content in my name. What can I do legally?",
  },
  {
    icon: "🏗️",
    label: "Builder not giving possession",
    text: "My builder is delaying possession of my flat for 2 years beyond the promised date. Can I get compensation?",
  },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeChatId, setActiveChatId] = useState(() => generateId());
  const [pendingFolderId, setPendingFolderId] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shareTargetChatId, setShareTargetChatId] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("basic");
  const [language, setLanguage] = useState(() => localStorage.getItem('nyay_language') || 'en-IN');
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  }, []);

  const { theme, toggleTheme } = useTheme();
  const { user, anonId, login, logout, getToken } = useAuth();
  const {
    history,
    folders,
    save,
    addFolder,
    removeFolder,
    moveToFolder,
    loadById,
    remove,
    clearAll,
    refresh,
  } = useChatHistory(user, getToken);

  const voice = useVoiceInput(
    useCallback((transcript) => {
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    }, []),
  );

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('nyay_language', language);
  }, [language]);

  const handleNewChat = useCallback((folderId = null) => {
    if (messages.length > 0) {
      save(activeChatId, messages, anonId, analysisMode, null, pendingFolderId || "general");
    }
    setMessages([]);
    setStarted(false);
    setInput("");
    setAttachment(null);
    setActiveChatId(generateId());
    setPendingFolderId(folderId);
    refresh();
    navigate("/");
  }, [messages, activeChatId, save, refresh, anonId, analysisMode, navigate, pendingFolderId]);

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

  const handleSelectChat = useCallback(
    (id) => {
      if (messages.length > 0) {
        save(activeChatId, messages, anonId, analysisMode);
      }
      const chat = loadById(id);
      if (chat) {
        setMessages(chat.messages);
        setActiveChatId(chat.id);
        setStarted(true);
        if (chat.analysisMode) setAnalysisMode(chat.analysisMode);
        navigate("/");
      }
    },
    [messages, activeChatId, save, loadById, anonId, analysisMode, navigate],
  );

  const handleDeleteChat = useCallback(
    (id) => {
      remove(id);
      if (id === activeChatId) {
        setMessages([]);
        setStarted(false);
        setActiveChatId(generateId());
      }
    },
    [remove, activeChatId],
  );

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  const handleShareChat = useCallback(
    (chatId) => {
      setShareTargetChatId(chatId || activeChatId);
      setShowShare(true);
    },
    [activeChatId],
  );

  const handleExportFullChat = useCallback(() => {
    const currentChat = messages;
    if (!currentChat || currentChat.length === 0) return;

    const chatFromHistory = history.find((c) => c.id === activeChatId);
    const title =
      chatFromHistory?.title ||
      currentChat.find((m) => m.role === "user")?.content?.slice(0, 50) ||
      "Legal Chat";

    exportPdf(null, null, currentChat, title);
  }, [messages, history, activeChatId]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !attachment) || loading) return;
    setInput("");
    const currentAttachment = attachment;
    setAttachment(null);
    setStarted(true);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let content = userText;

    if (currentAttachment) {
      try {
        const formData = new FormData();
        formData.append("file", currentAttachment);
        const ocrRes = await fetch("/v1/vision", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        if (ocrRes.ok) {
          const ocrData = await ocrRes.json();
          content += `\n\n[System: Attached document text extracted via OCR: "${ocrData.extracted_text}"]`;
        } else {
          content += `\n\n[Attached File: ${currentAttachment.name}] (OCR Failed)`;
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setLoading(false);
          return;
        }
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
        body: JSON.stringify({
          messages: newHistory,
          analysisMode: analysisMode,
          language: language || voice?.lang || "en-IN",
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      const updatedMessages = [
        ...newHistory,
        { role: "assistant", content: data.reply },
      ];
      setMessages(updatedMessages);

      // AI Title Generation for the first exchange
      let finalTitle = null;
      if (messages.length === 0) {
        try {
          const titleRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional legal clerk. Based on the user's first query, generate a VERY SHORT (max 5 words) professional title for this chat. Respond with ONLY the title. No punctuation unless necessary.",
                },
                userMsg,
              ],
              max_tokens: 20,
              temperature: 0.3,
            }),
            signal: controller.signal,
          });
          if (titleRes.ok) {
            const titleData = await titleRes.json();
            finalTitle = titleData.reply.replace(/[""]/g, "").trim();
          }
        } catch (err) {
          console.warn("Title generation failed:", err);
        }
      }

      save(activeChatId, updatedMessages, anonId, analysisMode, finalTitle, pendingFolderId || "general");
      setPendingFolderId(null); // Clear after first successful save
    } catch (err) {
      if (err.name === "AbortError") {
        // User stopped generation — don't show error
        setMessages(newHistory);
      } else {
        const errorMessages = [
          ...newHistory,
          {
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ];
        setMessages(errorMessages);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div
      className={`app ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      data-theme={theme}
    >
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {!location.pathname.startsWith("/counsel") && (
        <header className="floating-header">
          <div className="header-left">
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <div
              className="logo"
              onClick={handleNewChat}
              style={{ cursor: "pointer" }}
            >
              <span className="logo-icon">⚖️</span>
              <div className="logo-content">
                <span className="logo-name">NyayBot</span>
                <span className="logo-tag">Legal Aid for India</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <span className="theme-icons-wrapper">
                <span className={`icon-sun ${theme === "dark" ? "visible" : "hidden"}`}>☀️</span>
                <span className={`icon-moon ${theme === "light" ? "visible" : "hidden"}`}>🌙</span>
              </span>
            </button>
          </div>
        </header>
      )}

      {!location.pathname.startsWith("/counsel") && (
        <Sidebar
          history={history}
          folders={folders}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            handleSelectChat(id);
            if (window.innerWidth <= 900) setSidebarOpen(false);
          }}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onShareChat={handleShareChat}
          onMoveChatToFolder={moveToFolder}
          exampleQueries={EXAMPLE_QUERIES}
          onExampleClick={(text) => sendMessage(text)}
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onLogout={logout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSettingsClick={() => setShowSettings(true)}
        />
      )}

      <main className={`main ${location.pathname.startsWith("/counsel") ? "counsel-main" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {!started ? (
                  <Landing
                    exampleQueries={EXAMPLE_QUERIES}
                    onExampleClick={(text) => sendMessage(text)}
                  />
                ) : (
                  <ChatArea
                    messages={messages}
                    loading={loading}
                    chatTitle={
                      history.find((c) => c.id === activeChatId)?.title ||
                      messages
                        .find((m) => m.role === "user")
                        ?.content?.slice(0, 50) ||
                      "Legal Chat"
                    }
                    onShare={() => handleShareChat(activeChatId)}
                    onExportFullChat={handleExportFullChat}
                  />
                )}
                <InputBar
                  input={input}
                  setInput={setInput}
                  onSend={() => sendMessage()}
                  onStop={handleStopGeneration}
                  loading={loading}
                  inputRef={inputRef}
                  voice={voice}
                  attachment={attachment}
                  setAttachment={setAttachment}
                  analysisMode={analysisMode}
                  setAnalysisMode={setAnalysisMode}
                />
              </>
            }
          />
          <Route
            path="/dossiers"
            element={
              <DossierCenter
                folders={folders}
                history={history}
                onAddFolder={addFolder}
                onRemoveFolder={removeFolder}
                onMoveChatToFolder={moveToFolder}
                onSelectChat={handleSelectChat}
                onNewChatInFolder={handleNewChat}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                history={history}
                user={user}
                onSelectChat={handleSelectChat}
              />
            }
          />
          <Route path="/counsel" element={<CounselPortal />} />
          <Route
            path="/shared/:shareId"
            element={<SharedChatView getToken={getToken} user={user} />}
          />
        </Routes>
      </main>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(userData) => {
            login(userData);
            setShowLogin(false);
          }}
          onTermsClick={() => {
            setShowLogin(false);
            setShowTerms(true);
          }}
        />
      )}

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {showShare && (
        <ShareModal
          chatId={shareTargetChatId}
          messages={messages}
          user={user}
          getToken={getToken}
          onClose={() => setShowShare(false)}
        />
      )}

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          onClearHistory={() => {
            clearAll();
            handleClearChat(); // Also clears active current chat UI
          }}
          historyCount={history.length}
          analysisMode={analysisMode}
          setAnalysisMode={setAnalysisMode}
          language={language}
          setLanguage={setLanguage}
          user={user}
          voice={voice}
        />
      )}
    </div>
  );
}
