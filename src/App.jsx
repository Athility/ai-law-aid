import { useState, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Landing from "./components/Landing";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";
import useTheme from "./hooks/useTheme";
import useChatHistory from "./hooks/useChatHistory";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
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
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeChatId, setActiveChatId] = useState(() => generateId());
  const inputRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const { history, save, loadById, remove, refresh } = useChatHistory();

  const handleNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (messages.length > 0) {
      save(activeChatId, messages);
    }
    setMessages([]);
    setStarted(false);
    setInput("");
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
      save(activeChatId, messages);
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
      const updatedMessages = [...newHistory, { role: "assistant", content: data.reply }];
      setMessages(updatedMessages);
      // Auto-save after each response
      save(activeChatId, updatedMessages);
    } catch {
      const errorMessages = [...newHistory, { role: "assistant", content: "Something went wrong. Please try again." }];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        theme={theme}
        onToggleTheme={toggleTheme}
        history={history}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        exampleQueries={EXAMPLE_QUERIES}
        onExampleClick={(text) => sendMessage(text)}
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
        />
      </main>
    </div>
  );
}
