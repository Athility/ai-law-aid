import { useState, useCallback, useEffect } from "react";
import { encryptData, decryptData } from "../utils/crypto";

const STORAGE_KEY = "nyaybot-history";
const FOLDERS_KEY = "nyaybot-folders";
const MAX_CHATS = 50;

function loadAllLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } 
  catch { return []; }
}

function loadFoldersLocal() {
  try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]"); }
  catch { return []; }
}

function persistAllLocal(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
}

function persistFoldersLocal(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export default function useChatHistory(user, getToken) {
  const [history, setHistory] = useState(loadAllLocal);
  const [folders, setFolders] = useState(loadFoldersLocal);
  const isAuthenticated = !!user;

  // Migration & Initialization
  useEffect(() => {
    setHistory(prev => {
      const hasUncategorized = prev.some(chat => !chat.folderId);
      if (hasUncategorized) {
        // Ensure "General" folder exists
        setFolders(fPrev => {
          if (!fPrev.find(f => f.id === "general")) {
            const generalFolder = { id: "general", name: "General Cases", createdAt: Date.now(), updatedAt: Date.now() };
            const updatedFolders = [...fPrev, generalFolder];
            persistFoldersLocal(updatedFolders);
            return updatedFolders;
          }
          return fPrev;
        });

        const migrated = prev.map(chat => chat.folderId ? chat : { ...chat, folderId: "general" });
        persistAllLocal(migrated);
        return migrated;
      }
      return prev;
    });
  }, []);

  // Sync down from Firestore when user logs in
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
        const token = getToken();
        if (!token) return;

        // Fetch Folders first
        const folderRes = await fetch("/api/folders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (folderRes.ok) {
          const cloudFolders = await folderRes.json();
          setFolders(prev => {
            const merged = [...prev];
            cloudFolders.forEach(cf => {
              const idx = merged.findIndex(f => f.id === cf.id);
              if (idx === -1) merged.push(cf);
              else if (cf.updatedAt > merged[idx].updatedAt) merged[idx] = cf;
            });
            persistFoldersLocal(merged);
            return merged;
          });
        }

        // Fetch Chats
        const chatRes = await fetch("/api/chats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!chatRes.ok) throw new Error("Failed to fetch cloud chats");
        const cloudEncryptedChats = await chatRes.json();

        if (cloudEncryptedChats.length > 0) {
          const decryptedChats = [];
          for (const item of cloudEncryptedChats) {
            try {
              const data = await decryptData(item.encryptedData, item.iv, user.id);
              decryptedChats.push({
                ...data, // Contains messages, id, title, folderId
                id: item.id,
                title: item.title,
                folderId: item.folderId || data.folderId || "general",
                updatedAt: new Date(item.updatedAt).getTime()
              });
            } catch (err) {
              console.error("Failed to decrypt chat ID", item.id, err);
            }
          }

          setHistory((prev) => {
            const merged = [...prev];
            decryptedChats.forEach((dc) => {
              const existingIdx = merged.findIndex(c => c.id === dc.id);
              if (existingIdx !== -1) {
                if (dc.updatedAt > merged[existingIdx].updatedAt) {
                  merged[existingIdx] = dc;
                }
              } else {
                merged.push(dc);
              }
            });
            merged.sort((a, b) => b.updatedAt - a.updatedAt);
            persistAllLocal(merged);
            return merged;
          });
        }
      } catch (err) {
        console.error("Cloud sync error:", err);
      }
  }, [isAuthenticated, user?.id, getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveToCloud = useCallback(async (chatPayload) => {
    if (!isAuthenticated) return;
    try {
      const token = getToken();
      const { encryptedData, iv } = await encryptData(
        { id: chatPayload.id, title: chatPayload.title, messages: chatPayload.messages, folderId: chatPayload.folderId },
        user.id
      );

      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          id: chatPayload.id,
          title: chatPayload.title,
          folderId: chatPayload.folderId || "general",
          encryptedData, iv,
          updatedAt: new Date(chatPayload.updatedAt).toISOString()
        })
      });
    } catch (err) { console.error("Cloud save error:", err); }
  }, [isAuthenticated, user?.id, getToken]);

  const saveFolderToCloud = useCallback(async (folder) => {
    if (!isAuthenticated) return;
    try {
      const token = getToken();
      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(folder)
      });
    } catch (err) { console.error("Folder cloud save error:", err); }
  }, [isAuthenticated, getToken]);

  const addFolder = useCallback((name) => {
    const newFolder = { id: Date.now().toString(36), name, createdAt: Date.now(), updatedAt: Date.now() };
    setFolders(prev => {
      const updated = [...prev, newFolder];
      persistFoldersLocal(updated);
      return updated;
    });
    saveFolderToCloud(newFolder);
    return newFolder.id;
  }, [saveFolderToCloud]);

  const save = useCallback((id, messages, anonId, analysisMode = "basic", customTitle = null, folderId = "general") => {
    if (!messages || messages.length === 0) return;
    setHistory((prev) => {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const defaultTitle = firstUserMsg
        ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? "…" : "")
        : "New Chat";
      
      const existing = prev.find((c) => c.id === id);
      const title = customTitle || (existing ? existing.title : defaultTitle);
      const actualFolderId = folderId || (existing ? existing.folderId : "general");
      
      const updatedAt = Date.now();
      const newChatPayload = { ...existing, id, messages, title, folderId: actualFolderId, updatedAt, anonId, analysisMode };
      
      const updated = existing 
        ? prev.map((c) => c.id === id ? newChatPayload : c)
        : [newChatPayload, ...prev];
      
      updated.sort((a, b) => b.updatedAt - a.updatedAt);
      persistAllLocal(updated);
      saveToCloud(newChatPayload);
      return updated;
    });
  }, [saveToCloud]);

  const loadById = useCallback((id) => loadAllLocal().find((c) => c.id === id) || null, []);

  const remove = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persistAllLocal(updated);
      if (isAuthenticated) {
        const token = getToken();
        fetch(`/api/chats/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      }
      return updated;
    });
  }, [isAuthenticated, getToken]);

  const removeFolder = useCallback((folderId) => {
    setFolders(prev => {
      const updated = prev.filter(f => f.id !== folderId);
      persistFoldersLocal(updated);
      return updated;
    });
    // Also move chats inside to 'general' or delete? Requirement says manage, let's keep them and move to general
    setHistory(prev => {
      const updated = prev.map(c => c.folderId === folderId ? { ...c, folderId: "general" } : c);
      persistAllLocal(updated);
      return updated;
    });
  }, []);

  const moveToFolder = useCallback((chatId, folderId) => {
    setHistory(prev => {
      const updated = prev.map(c => c.id === chatId ? { ...c, folderId } : c);
      persistAllLocal(updated);
      
      const chat = updated.find(c => c.id === chatId);
      if (chat) saveToCloud(chat); // Sync change to cloud
      
      return updated;
    });
  }, [saveToCloud]);

  const clearAll = useCallback(async () => {
    setHistory([]);
    setFolders([{ id: "general", name: "General Cases", createdAt: Date.now(), updatedAt: Date.now() }]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOLDERS_KEY);
    
    if (isAuthenticated) {
      try {
        const token = getToken();
        // Clear cloud chats
        await fetch("/api/chats", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        // Clear cloud folders
        await fetch("/api/folders", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Failed to clear cloud history:", err);
      }
    }
  }, [isAuthenticated, getToken]);

  return { history, folders, save, addFolder, removeFolder, moveToFolder, loadById, remove, clearAll, refresh };
}
