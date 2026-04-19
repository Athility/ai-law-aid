import { useState, useRef, useEffect } from "react";
import "./InputBar.css";

export default function InputBar({ input, setInput, onSend, onStop, loading, inputRef, voice, attachment, setAttachment, analysisMode, setAnalysisMode }) {
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const fileInputRef = useRef(null);
  const modePickerRef = useRef(null);

  const MODES = [
    { id: 'basic', label: 'Basic', icon: '⚡', desc: 'Fast, essential legal guidance.' },
    { id: 'advanced', label: 'Advanced', icon: '🔍', desc: 'Detailed case law search.' },
    { id: 'deep', label: 'Deep', icon: '💎', desc: 'Full citations & legal strategy.' }
  ];

  const activeMode = MODES.find(m => m.id === analysisMode) || MODES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modePickerRef.current && !modePickerRef.current.contains(e.target)) {
        setShowModePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && setAttachment) {
      setAttachment(file);
    }
  };

  const isExpanded = input.length > 40 || input.includes('\n');

  return (
    <div className="input-bar">
      {/* Voice interim preview (floats above) */}
      {voice?.isListening && voice.interimText && (
        <div className="voice-interim">
          <span className="interim-dot" />
          <span className="interim-text">{voice.interimText}</span>
        </div>
      )}

      <div className={`input-box-wrapper ${isExpanded ? 'expanded' : ''}`}>
        {/* File attachment preview */}
        {attachment && (
          <div className="attachment-preview">
            <div className="attachment-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span className="attachment-name">{attachment.name}</span>
            <button className="remove-attachment-btn" onClick={() => setAttachment(null)}>✕</button>
          </div>
        )}

        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={voice?.isListening ? "Listening..." : "Describe your legal problem in Language of your Choice..."}
          rows={1}
        />

        <div className="input-tools-row">
          <div className="left-tools">
            <button 
              className="icon-btn attach-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload evidence or document"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*,.pdf" 
              onChange={handleFileChange} 
            />

            {/* Analysis Mode Dropdown */}
            <div className="analysis-mode-dropdown" ref={modePickerRef}>
              <button 
                className={`mode-trigger-btn ${analysisMode}-active ${showModePicker ? 'active' : ''}`}
                onClick={() => setShowModePicker(!showModePicker)}
                title="Select Analysis Mode"
              >
                <span className="mode-icon">{activeMode.icon}</span>
                <span className="mode-label">{activeMode.label}</span>
                <svg className={`chevron-icon ${showModePicker ? 'up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {showModePicker && (
                <div className="mode-menu">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      className={`mode-option ${m.id} ${analysisMode === m.id ? 'active' : ''}`}
                      onClick={() => { setAnalysisMode(m.id); setShowModePicker(false); }}
                    >
                      <div className="option-icon">{m.icon}</div>
                      <div className="option-details">
                        <span className="option-label">{m.label}</span>
                        <span className="option-desc">{m.desc}</span>
                      </div>
                      {analysisMode === m.id && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice controls */}
            {voice?.supported && (
              <div className="voice-controls">
                <button
                  className={`icon-btn voice-btn ${voice.isListening ? "listening" : ""}`}
                  onClick={voice.toggleListening}
                  title={voice.isListening ? "Stop listening" : "Start voice input"}
                >
                  {voice.isListening ? (
                    <div className="voice-waves">
                      <span className="wave" /><span className="wave" /><span className="wave" />
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>

                {/* Language picker toggle */}
                <button
                  className="lang-btn"
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  title="Change voice language"
                >
                  {voice.languages.find((l) => l.code === voice.lang)?.short || "EN"}
                  <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Language dropdown */}
                {showLangPicker && (
                  <div className="lang-picker">
                    {voice.languages.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-option ${l.code === voice.lang ? "active" : ""}`}
                        onClick={() => { voice.setLang(l.code); setShowLangPicker(false); }}
                      >
                        <span className="lang-short">{l.short}</span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="right-tools">
            {loading ? (
              <button
                className="send-btn stop-btn"
                onClick={onStop}
                title="Stop generating"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={onSend}
                disabled={!input.trim() && !attachment}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
