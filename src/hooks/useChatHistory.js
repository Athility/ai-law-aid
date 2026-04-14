import { useState, useCallback } from "react";

const STORAGE_KEY = "nyaybot-history";
const MAX_CHATS = 50;

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistAll(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
}

export default function useChatHistory() {
  const [history, setHistory] = useState(loadAll);

  const save = useCallback((id, messages) => {
    if (!messages || messages.length === 0) return;
    setHistory((prev) => {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "…" : "")
        : "New Chat";
      const existing = prev.find((c) => c.id === id);
      let updated;
      if (existing) {
        updated = prev.map((c) =>
          c.id === id ? { ...c, messages, title, updatedAt: Date.now() } : c
        );
      } else {
        updated = [{ id, title, messages, createdAt: Date.now(), updatedAt: Date.now() }, ...prev];
      }
      updated.sort((a, b) => b.updatedAt - a.updatedAt);
      persistAll(updated);
      return updated;
    });
  }, []);

  const loadById = useCallback((id) => {
    const all = loadAll();
    return all.find((c) => c.id === id) || null;
  }, []);

  const remove = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persistAll(updated);
      return updated;
    });
  }, []);

  const refresh = useCallback(() => {
    setHistory(loadAll());
  }, []);

  return { history, save, loadById, remove, refresh };
}
