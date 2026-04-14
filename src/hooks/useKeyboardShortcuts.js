import { useEffect } from "react";

export default function useKeyboardShortcuts({ onNewChat, onClearChat, inputRef }) {
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+N — New chat
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        onNewChat?.();
      }
      // Ctrl+L — Clear current chat
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        onClearChat?.();
      }
      // / — Focus input (only if not already in an input/textarea)
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef?.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNewChat, onClearChat, inputRef]);
}
