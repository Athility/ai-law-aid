import { useState } from "react";
import "./TermsModal.css";

export default function TermsModal({ onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`terms-modal ${isExpanded ? "expanded" : "compact"}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="terms-header">
          <div className="terms-icon">⚖️</div>
          <h2>Terms of Service</h2>
          <p>Please review our core safety and privacy promises.</p>
        </div>

        <div className="terms-content">
          <div className="terms-summary">
            <div className="summary-item">
              <span className="item-icon">🛡️</span>
              <div className="item-text">
                <strong>End-to-End Encryption</strong>
                <p>Your chats are encrypted on your device. Only you can read them.</p>
              </div>
            </div>
            <div className="summary-item">
              <span className="item-icon">🚫</span>
              <div className="item-text">
                <strong>Not Legal Advice</strong>
                <p>NyayBot provides information, not legal representation.</p>
              </div>
            </div>
            <div className="summary-item">
              <span className="item-icon">🕵️</span>
              <div className="item-text">
                <strong>Private by Design</strong>
                <p>We do not store your plaintext conversations on our servers.</p>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="full-document fade-in">
              <h3>1. Nature of Service</h3>
              <p>NyayBot (the "Service") is an AI-powered legal information assistant designed to help users understand Indian laws. It uses large language models to process queries.</p>
              
              <h3>2. Not a Substitute for a Lawyer</h3>
              <p>The information provided by NyayBot is for educational purposes only. It does not constitute legal advice, an attorney-client relationship, or a substitute for a licensed legal professional.</p>

              <h3>3. Security & Encryption</h3>
              <p>We employ AES-256-GCM client-side encryption. NyayBot staff cannot access your saved case data. You are responsible for keeping your Google account secure.</p>

              <h3>4. Limitation of Liability</h3>
              <p>While we strive for accuracy, law is complex and constantly changing. NyayBot is not liable for errors, omissions, or actions taken based on its responses.</p>

              <h3>5. Prohibited Use</h3>
              <p>You may not use NyayBot to generate fraudulent legal documents or engage in harassment.</p>
            </div>
          )}
        </div>

        <div className="terms-footer">
          {!isExpanded ? (
            <button className="expand-btn" onClick={() => setIsExpanded(true)}>
              Read Full Document
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          ) : (
            <button className="expand-btn" onClick={() => setIsExpanded(false)}>
              Show Summary
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
          )}
          <button className="accept-btn" onClick={onClose}>I Understand</button>
        </div>
      </div>
    </div>
  );
}
