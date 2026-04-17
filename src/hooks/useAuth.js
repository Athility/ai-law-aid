import { useState, useCallback, useEffect } from "react";

/**
 * Handles anonymous logic and mock phone authentication.
 */
export default function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nyaybot-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [anonId, setAnonId] = useState(() => {
    const saved = localStorage.getItem("nyaybot-anon-id");
    if (saved) return saved;
    const newId = "anon_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("nyaybot-anon-id", newId);
    return newId;
  });

  // Persist user state
  useEffect(() => {
    if (user) {
      localStorage.setItem("nyaybot-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nyaybot-user");
    }
  }, [user]);

  const login = useCallback((userData) => {
    const newUser = {
      ...userData,
      joinedAt: new Date().toISOString(),
      isVerified: true
    };
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    anonId,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
