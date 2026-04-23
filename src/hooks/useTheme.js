import { useState, useEffect, useCallback } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("nyaybot-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nyaybot-theme", theme);
  }, [theme]);

  // Sync state across different instances of the hook
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "nyaybot-theme" && e.newValue) {
        setTheme(e.newValue);
      }
    };
    
    // Listen for custom event from other components
    const handleCustom = (e) => {
      setTheme(e.detail);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("themeChange", handleCustom);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("themeChange", handleCustom);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const newTheme = t === "dark" ? "light" : "dark";
      // Dispatch custom event to notify other useTheme instances
      window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }));
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
}
