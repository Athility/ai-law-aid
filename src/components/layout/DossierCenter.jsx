import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generateJrfFile } from "../../utils/jrfUtils";
import "./DossierCenter.css";

export default function DossierCenter({ 
  folders, 
  history, 
  onAddFolder, 
  onRemoveFolder, 
  onSelectChat, 
  onMoveChatToFolder,
  onNewChatInFolder 
}) {
  const { search: querySearch } = useLocation();
  const folderParam = new URLSearchParams(querySearch).get("folder");
  
  const [search, setSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showJrfModal, setShowJrfModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState("");
  const modalInputRef = useRef(null);

  // Sync with URL param
  useEffect(() => {
    if (folderParam) {
      setSelectedFolderId(folderParam);
    }
  }, [folderParam]);

  // Auto-focus the input when modal opens
  useEffect(() => {
    if (showCreateModal && modalInputRef.current) {
      modalInputRef.current.focus();
    }
  }, [showCreateModal]);

  // Group chats by folder for the specific folder view
  const folderStats = useMemo(() => {
    const stats = {};
    history.forEach(chat => {
      const fid = chat.folderId || "general";
      if (!stats[fid]) stats[fid] = { count: 0, lastActivity: 0 };
      stats[fid].count++;
      if (chat.updatedAt > stats[fid].lastActivity) stats[fid].lastActivity = chat.updatedAt;
    });
    return stats;
  }, [history]);

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFolder = folders.find(f => f.id === (selectedFolderId || ""));
  const folderChats = history.filter(c => c.folderId === selectedFolderId);

  // Step 1: Button click opens the custom modal instead of window.confirm
  const handleGenerateJargon = () => {
    if (!selectedFolderId || !selectedFolder) return;
    setShowJrfModal(true);
  };

  // Step 2: User accepts terms inside the modal → run the actual generation
  const handleConfirmJrf = async () => {
    setShowJrfModal(false);
    setGenerating(true);
    try {
      const success = await generateJrfFile(selectedFolderId, selectedFolder.name, folderChats);
      if (success) {
        alert("Jargonized Report (.jrf) generated successfully!");
      } else {
        alert("Error generating report. Check the browser console for details.");
      }
    } catch (err) {
      console.error("JRF Fatal Error:", err);
      alert("A fatal error occurred during JRF generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateDossier = () => {
    setNewCaseName("");
    setShowCreateModal(true);
  };

  const handleSubmitNewCase = (e) => {
    e.preventDefault();
    const name = newCaseName.trim();
    if (!name) return;
    const newId = onAddFolder(name);
    setShowCreateModal(false);
    setNewCaseName("");
    if (newId) {
      setSelectedFolderId(newId);
    }
  };
  const handleImportChat = (chatId) => {
    if (!selectedFolderId) return;
    onMoveChatToFolder(chatId, selectedFolderId);
    // Modal stays open so user can import multiple, or we can close it
  };

  const importableChats = history.filter(c => c.folderId !== selectedFolderId);
  return (
    <div className="dossier-page">
      <div className="dossier-header">
        <div className="header-titles">
          <h1 className="page-title">Client Command Center</h1>
          <p className="page-subtitle">Secure Vault / Total Case Dossiers</p>
        </div>
        <div className="header-actions">
          <button className="create-folder-btn" onClick={handleCreateDossier} type="button">
            <span className="plus">+</span> New Case Dossier
          </button>
        </div>
      </div>

      <div className="search-bar-container">
        <input 
          type="text" 
          placeholder="Search your legal vault..." 
          className="dossier-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selectedFolderId ? (
        <div className="folder-detail-view">
          <button className="back-btn" onClick={() => setSelectedFolderId(null)}>← Back to All Dossiers</button>
          <div className="folder-detail-header">
            <div className="folder-info">
              <span className="folder-id-tag">DOSSIER ID: {selectedFolderId.toUpperCase()}</span>
              <h2>{selectedFolder?.name || "Accessing Dossier..."}</h2>
            </div>
            <div className="folder-actions">
               <button className="new-chat-in-folder-btn" onClick={() => onNewChatInFolder(selectedFolderId)}>
                 <span className="plus">+</span> New Chat
               </button>
               <button className="import-chat-btn" onClick={() => setShowImportModal(true)}>
                 <span className="import-icon">📥</span> Import Existing
               </button>
               <button 
                 className="jargon-report-btn" 
                 onClick={handleGenerateJargon} 
                 disabled={generating || folderChats.length === 0}
                 type="button"
               >
                 <span className="sparkle">✨</span> {generating ? "Compiling..." : "Generate Jargonized Report"}
               </button>
            </div>
          </div>

          <div className="chat-grid">
            {folderChats.length === 0 ? (
              <div className="empty-state">No chat records in this dossier.</div>
            ) : (
              folderChats.map(chat => (
                <button key={chat.id} className="chat-card" onClick={() => onSelectChat(chat.id)}>
                   <span className="chat-card-title">{chat.title}</span>
                   <span className="chat-card-date">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="dossier-grid">
          {filteredFolders.map(folder => {
            const stats = folderStats[folder.id] || { count: 0, lastActivity: 0 };
            return (
              <div key={folder.id} className="dossier-card" onClick={() => setSelectedFolderId(folder.id)}>
                <div className="card-glass"></div>
                <div className="card-top">
                  <div className="legal-icon">⚖️</div>
                  <span className="activity-tag">
                    {stats.lastActivity ? `Active ${new Date(stats.lastActivity).toLocaleDateString()}` : "No Activity"}
                  </span>
                </div>
                <div className="card-body">
                  <h3 className="folder-card-name">{folder.name}</h3>
                  <div className="folder-card-meta">
                    <span className="chat-count">{stats.count} Chat Records</span>
                  </div>
                </div>
                <div className="card-footer">
                   <span className="view-dossier">Open Dossier →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Create Dossier Modal — replaces window.prompt */}
      {showCreateModal && (
        <div className="create-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-emblem">📁</div>
            <h2>New Case Dossier</h2>
            <p>Enter a name for your new legal case folder.</p>
            <form onSubmit={handleSubmitNewCase}>
              <input
                ref={modalInputRef}
                type="text"
                placeholder="e.g. Landlord Dispute, Cyber Fraud Case"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
                autoFocus
              />
              <div className="create-modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn" disabled={!newCaseName.trim()}>
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Chat Modal */}
      {showImportModal && (
        <div className="create-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="create-modal-card import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-emblem">📥</div>
            <h2>Import Chat to Dossier</h2>
            <p>Select a chat from your other dossiers or 'General' to move it here.</p>
            
            <div className="import-chat-list">
              {importableChats.length === 0 ? (
                <p className="empty-import">No other chats available to import.</p>
              ) : (
                importableChats.map(chat => (
                  <div key={chat.id} className="import-chat-item">
                    <div className="import-chat-info">
                      <span className="import-chat-title">{chat.title || "Untitled Chat"}</span>
                      <span className="import-chat-meta">Currently in: {chat.folderId || "general"}</span>
                    </div>
                    <button className="do-import-btn" onClick={() => handleImportChat(chat.id)}>Move Here</button>
                  </div>
                ))
              )}
            </div>

            <div className="create-modal-actions">
              <button type="button" className="modal-submit-btn" onClick={() => setShowImportModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== JRF Terms & Conditions Modal ========== */}
      {showJrfModal && (
        <div className="create-modal-overlay" onClick={() => setShowJrfModal(false)}>
          <div className="create-modal-card jrf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="create-modal-emblem">📜</div>
            <h2>Generate Jargonized Report</h2>
            <div className="jrf-terms-body">
              <p className="jrf-terms-heading">Terms & Conditions</p>
              <ul className="jrf-terms-list">
                <li>This will compile <strong>all raw chat data</strong> in this dossier into a structured legal brief.</li>
                <li>The output is a <strong>.jrf</strong> (Jargonized Report File) formatted for advocate review.</li>
                <li>This is <strong>NOT</strong> a final legal document — it is intended <strong>only</strong> for your counsel's internal reference.</li>
                <li>Generation typically takes <strong>60–90 seconds</strong> depending on dossier size.</li>
              </ul>
              <p className="jrf-terms-footer">By clicking "Accept & Generate" you acknowledge the above.</p>
            </div>
            <div className="create-modal-actions">
              <button type="button" className="modal-cancel-btn" onClick={() => setShowJrfModal(false)}>
                Cancel
              </button>
              <button type="button" className="modal-submit-btn" onClick={handleConfirmJrf}>
                ✨ Accept & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Generating Overlay (NON-DISMISSABLE) ========== */}
      {generating && (
        <div className="jrf-generating-overlay">
          <div className="jrf-generating-card">
            <div className="jrf-spinner"></div>
            <h3>Compiling Legal Brief…</h3>
            <p>The AI is jargonizing your chat records into a formal advocate report. This may take 60–90 seconds.</p>
            <p className="jrf-lock-notice">🔒 Please do not close this window</p>
          </div>
        </div>
      )}
    </div>
  );
}
