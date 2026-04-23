import React, { useState, useEffect, useRef } from 'react';
import useTheme from '../../hooks/useTheme';
import './SettingsModal.css';

export default function SettingsModal({ onClose, onClearHistory, historyCount, analysisMode, setAnalysisMode, language, setLanguage, user, voice }) {
  const { theme, toggleTheme } = useTheme();
  const [showWarning, setShowWarning] = useState(false);

  // Settings State
  const [exportCitations, setExportCitations] = useState(() => localStorage.getItem('nyay_export_citations') !== 'false');
  const [cloudSync, setCloudSync] = useState(() => localStorage.getItem('nyay_cloud_sync') !== 'false');

  // Save changes to localStorage
  useEffect(() => localStorage.setItem('nyay_language', language), [language]);
  useEffect(() => localStorage.setItem('nyay_analysis_mode', analysisMode), [analysisMode]);
  useEffect(() => localStorage.setItem('nyay_export_citations', exportCitations), [exportCitations]);
  useEffect(() => localStorage.setItem('nyay_cloud_sync', cloudSync), [cloudSync]);

  const handleClearConfirm = () => {
    onClearHistory();
    onClose();
  };

  const handleDownloadData = () => {
    const history = localStorage.getItem('nyaybot-history') || '[]';
    const folders = localStorage.getItem('nyaybot-folders') || '[]';
    const data = JSON.stringify({ history: JSON.parse(history), folders: JSON.parse(folders) }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyaybot_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (jsonData.history) {
          localStorage.setItem('nyaybot-history', JSON.stringify(jsonData.history));
        }
        if (jsonData.folders) {
          localStorage.setItem('nyaybot-folders', JSON.stringify(jsonData.folders));
        }
        alert('Data imported successfully! Please refresh the page to see changes.');
        window.location.reload();
      } catch (err) {
        console.error("Failed to parse import file", err);
        alert('Invalid JSON file. Please upload a valid NyayBot backup file.');
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal modal-content" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-body">
          <div className="settings-section">
            <h3>Account Details</h3>
            <div className="account-info">
              {user ? (
                <div className="user-profile">
                  <div className="user-avatar-large">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <div className="avatar-placeholder">{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
                    )}
                  </div>
                  <div className="user-text-info">
                    <span className="user-name">{user.displayName || 'Legal User'}</span>
                    <span className="user-email">{user.email || 'No email provided'}</span>
                    <span className="account-type">{user.isAnonymous ? 'Anonymous Account' : 'Verified Professional'}</span>
                  </div>
                </div>
              ) : (
                <div className="no-user-info">
                  <p>Not signed in. Sign in to sync your data across devices.</p>
                </div>
              )}
            </div>
          </div>
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <span>Theme</span>
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Personalization</h3>
            <div className="setting-item">
              <span>Default AI Language</span>
              <select className="setting-select" value={language} onChange={e => setLanguage(e.target.value)}>
                {voice?.languages?.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="setting-item">
              <span>Voice Input Dialect</span>
              <select className="setting-select" value={voice?.lang} onChange={e => voice.setLang(e.target.value)}>
                {voice?.languages?.map(l => (
                  <option key={l.code} value={l.code}>{l.label} ({l.short})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Application Behavior</h3>
            <div className="setting-item">
              <span>Default Analysis Mode</span>
              <select className="setting-select" value={analysisMode} onChange={e => setAnalysisMode(e.target.value)}>
                <option value="basic">⚡ Basic Intelligence</option>
                <option value="advanced">🔍 Advanced Analysis</option>
                <option value="deep">💎 Deep Strategy</option>
              </select>
            </div>
            <div className="setting-item">
              <span>Include AI Citations in Export</span>
              <label className="setting-toggle-wrapper">
                <input 
                  type="checkbox" 
                  className="setting-toggle" 
                  checked={exportCitations} 
                  onChange={e => setExportCitations(e.target.checked)} 
                />
              </label>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <h3>Account & Security</h3>
            <div className="setting-item" style={{ marginBottom: '12px' }}>
              <span>Cloud Sync Enabled</span>
              <label className="setting-toggle-wrapper">
                <input 
                  type="checkbox" 
                  className="setting-toggle" 
                  checked={cloudSync} 
                  onChange={e => setCloudSync(e.target.checked)} 
                />
              </label>
            </div>

            <div className="setting-item">
              <span>Data Import/Export</span>
              <div className="data-actions">
                <button className="action-btn" onClick={handleDownloadData}>
                  ⬇️ Export
                </button>
                <button className="action-btn" onClick={handleImportClick}>
                  ⬆️ Import
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".json"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {!showWarning ? (
              <div className="setting-item" style={{ marginTop: '8px' }}>
                <span>Clear Chat History ({historyCount} chats)</span>
                <button 
                  className="danger-btn" 
                  onClick={() => setShowWarning(true)}
                  disabled={historyCount === 0}
                >
                  Clear All History
                </button>
              </div>
            ) : (
              <div className="warning-box" style={{ marginTop: '8px' }}>
                <h4>⚠️ Are you sure?</h4>
                <p>This will permanently delete all your chat history and folders. This action cannot be undone.</p>
                <div className="warning-actions">
                  <button className="cancel-btn" onClick={() => setShowWarning(false)}>Cancel</button>
                  <button className="confirm-danger-btn" onClick={handleClearConfirm}>Yes, Delete Everything</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
