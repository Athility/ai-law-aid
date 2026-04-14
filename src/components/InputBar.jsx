import "./InputBar.css";

export default function InputBar({ input, setInput, onSend, loading, inputRef }) {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
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
      <button
        className="send-btn"
        onClick={onSend}
        disabled={loading || !input.trim()}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
