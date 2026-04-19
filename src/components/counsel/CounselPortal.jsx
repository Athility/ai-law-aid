import { useState, useRef, useMemo, useCallback } from "react";
import { parseJrfFile } from "../../utils/jrfUtils";
import { exportCounselPdf } from "../../utils/CounselPdfExport";
import { analyzeDossier, extractStatutes, extractTimeline } from "../../utils/dossierAnalysis";
import "./CounselPortal.css";

export default function CounselPortal() {
  const [accessCode, setAccessCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("brief");
  const [noticeType, setNoticeType] = useState("general");
  const [noticeContent, setNoticeContent] = useState(null);
  const [generatingNotice, setGeneratingNotice] = useState(false);
  const fileInputRef = useRef(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (accessCode === "advocate2026") {
      setVerified(true);
      setError(null);
    } else {
      setError("Invalid Access Code. Please contact administration.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseJrfFile(file);
      setDossier(data);
      setError(null);
      setActiveTab("brief");
    } catch (err) {
      setError(err.message || "Failed to parse Dossier file.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Memoized analysis - runs once when dossier loads
  const analysis = useMemo(() => dossier ? analyzeDossier(dossier) : null, [dossier]);
  const timeline = useMemo(() => dossier ? extractTimeline(dossier) : [], [dossier]);
  const statutes = useMemo(() => dossier ? extractStatutes(dossier.legalBrief) : [], [dossier]);

  // Generate Legal Notice via backend
  const handleGenerateNotice = useCallback(async () => {
    if (!dossier?.legalBrief || generatingNotice) return;
    setGeneratingNotice(true);
    setNoticeContent(null);
    try {
      const res = await fetch("/v1/generate-legal-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legal_brief: dossier.legalBrief,
          notice_type: noticeType,
        }),
      });
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setNoticeContent(data.notice);
    } catch (err) {
      setNoticeContent("❌ Failed to generate notice. Ensure the Python engine is running on port 5000.");
    } finally {
      setGeneratingNotice(false);
    }
  }, [dossier, noticeType, generatingNotice]);

  // ==================== AUTH SCREEN ====================
  if (!verified) {
    return (
      <div className="counsel-auth-wrapper">
        <div className="counsel-auth-card">
          <div className="counsel-emblem">⚖️</div>
          <h2>Advocate Verification</h2>
          <p>This portal is restricted to verified legal counsel.</p>
          <form onSubmit={handleVerify}>
            <input
              type="password"
              placeholder="Enter Access Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
            <button type="submit">Unlock Portal</button>
          </form>
          {error && <p className="counsel-error">{error}</p>}
        </div>
      </div>
    );
  }

  // ==================== TAB DEFINITIONS ====================
  const tabs = [
    { id: "brief", label: "Statutory Brief", icon: "💼" },
    { id: "analytics", label: "Case Analytics", icon: "📊" },
    { id: "statutes", label: "Statute Linker", icon: "📖" },
    { id: "timeline", label: "Timeline", icon: "🕐" },
    { id: "drafter", label: "AI Drafter", icon: "✍️" },
    { id: "transcripts", label: "Transcripts", icon: "📄" },
  ];

  // ==================== MAIN PORTAL ====================
  return (
    <div className="counsel-portal">
      <div className="counsel-header">
        <h1>Advocate Private Counsel Workspace</h1>
        <p className="counsel-tagline">Secure Analysis & Dossier Review</p>
      </div>

      {!dossier ? (
        <div className="dropzone-area" onClick={() => fileInputRef.current?.click()}>
          <div className="dropzone-icon">📥</div>
          <h3>Upload Case Dossier</h3>
          <p>Click or drag a <strong>.jrf</strong> file here to begin analysis.</p>
          <input
            type="file"
            accept=".jrf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          {error && <p className="counsel-error" style={{ marginTop: "20px" }}>{error}</p>}
        </div>
      ) : (
        <div className="dossier-dashboard">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="dashboard-meta">
              <h2>Case: {dossier.metadata.folderName}</h2>
              <span className="metadata-pill">📁 {dossier.metadata.totalChats} Transcript{dossier.metadata.totalChats > 1 ? "s" : ""}</span>
              <span className="metadata-pill">📅 {new Date(dossier.metadata.exportDate).toLocaleDateString()}</span>
              {analysis && <span className={`metadata-pill urgency-${analysis.urgencyLabel.toLowerCase()}`}>🔴 Urgency: {analysis.urgencyLabel}</span>}
            </div>
            <div className="dashboard-actions">
              <button className="export-pdf-btn" onClick={() => exportCounselPdf(dossier)}>
                🖨️ Export Brief
              </button>
              <button className="reset-dossier-btn" onClick={() => { setDossier(null); setNoticeContent(null); }}>
                Close Dossier
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="counsel-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`counsel-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="counsel-tab-content">

            {/* ===== STATUTORY BRIEF ===== */}
            {activeTab === "brief" && (
              <div className="tab-panel panel-brief">
                <div className="panel-header-bar">
                  <span className="panel-icon">§</span>
                  <h3>Statutory Analysis & AI Jargonized Brief</h3>
                </div>
                <div className="panel-body">
                  <pre className="brief-content">{dossier.legalBrief}</pre>
                </div>
              </div>
            )}

            {/* ===== CASE ANALYTICS ===== */}
            {activeTab === "analytics" && analysis && (
              <div className="tab-panel panel-analytics">
                <div className="panel-header-bar">
                  <span className="panel-icon">📊</span>
                  <h3>Verification Audit Trail & Case Intelligence</h3>
                </div>
                <div className="panel-body">
                  {/* Stats Grid */}
                  <div className="analytics-grid">
                    <div className="stat-card">
                      <div className="stat-value">{analysis.totalExchanges}</div>
                      <div className="stat-label">Client Exchanges</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{analysis.avgUserMsgLength}</div>
                      <div className="stat-label">Avg. Message Length (chars)</div>
                    </div>
                    <div className={`stat-card urgency-card urgency-${analysis.urgencyLabel.toLowerCase()}`}>
                      <div className="stat-value">{analysis.urgencyScore}%</div>
                      <div className="stat-label">Urgency Score</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{analysis.sentiment}</div>
                      <div className="stat-label">Client Sentiment</div>
                    </div>
                  </div>

                  {/* Legal Themes */}
                  <div className="analytics-section">
                    <h4>🏛️ Detected Legal Themes</h4>
                    <div className="tag-row">
                      {analysis.themes.map((t, i) => (
                        <span key={i} className="theme-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Grievances */}
                  {analysis.grievances.length > 0 && (
                    <div className="analytics-section">
                      <h4>⚠️ Key Grievances Detected</h4>
                      <div className="tag-row">
                        {analysis.grievances.map((g, i) => (
                          <span key={i} className="grievance-tag">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Statute Count */}
                  <div className="analytics-section">
                    <h4>📖 Statutory References</h4>
                    <p className="analytics-detail">{statutes.length} statute{statutes.length !== 1 ? "s" : ""} cited in the AI brief. View the <button className="inline-link" onClick={() => setActiveTab("statutes")}>Statute Linker</button> for details.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STATUTE LINKER ===== */}
            {activeTab === "statutes" && (
              <div className="tab-panel panel-statutes">
                <div className="panel-header-bar">
                  <span className="panel-icon">📖</span>
                  <h3>Statute & Precedent Quick-Reference</h3>
                </div>
                <div className="panel-body">
                  {statutes.length === 0 ? (
                    <p className="no-data-msg">No specific statutory references were detected in the AI brief.</p>
                  ) : (
                    <div className="statutes-grid">
                      {statutes.map((s, i) => (
                        <div key={i} className="statute-card">
                          <div className="statute-badge">{s.type === "article" ? "Art." : "§"}</div>
                          <div className="statute-info">
                            <div className="statute-text">{s.text}</div>
                            <a
                              href={s.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="statute-link"
                            >
                              View on Indian Kanoon →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== TIMELINE ===== */}
            {activeTab === "timeline" && (
              <div className="tab-panel panel-timeline">
                <div className="panel-header-bar">
                  <span className="panel-icon">🕐</span>
                  <h3>Case Timeline Visualizer</h3>
                </div>
                <div className="panel-body">
                  <div className="timeline-container">
                    {timeline.map((event, i) => (
                      <div key={i} className={`timeline-node type-${event.type}`}>
                        <div className="timeline-connector">
                          <div className="timeline-dot">{event.icon}</div>
                          {i < timeline.length - 1 && <div className="timeline-line" />}
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-label">{event.label}</div>
                          <div className="timeline-detail">{event.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== AI DRAFTER ===== */}
            {activeTab === "drafter" && (
              <div className="tab-panel panel-drafter">
                <div className="panel-header-bar">
                  <span className="panel-icon">✍️</span>
                  <h3>AI Legal Notice Drafting Assistant</h3>
                </div>
                <div className="panel-body">
                  <div className="drafter-controls">
                    <div className="drafter-type-select">
                      <label>Notice Type:</label>
                      <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
                        <option value="general">General Legal Notice</option>
                        <option value="cease_desist">Cease & Desist</option>
                        <option value="demand">Demand Notice</option>
                        <option value="complaint">Formal Complaint</option>
                      </select>
                    </div>
                    <button
                      className="generate-notice-btn"
                      onClick={handleGenerateNotice}
                      disabled={generatingNotice}
                    >
                      {generatingNotice ? (
                        <>
                          <span className="notice-spinner" />
                          Drafting Notice...
                        </>
                      ) : (
                        "⚡ Generate Draft"
                      )}
                    </button>
                  </div>

                  {generatingNotice && (
                    <div className="drafter-loading-msg">
                      <p>🔒 AI is drafting your legal notice. This may take 60-120 seconds...</p>
                    </div>
                  )}

                  {noticeContent && !generatingNotice && (
                    <div className="notice-output">
                      <div className="notice-output-header">
                        <span>📜 Generated Draft</span>
                        <button
                          className="copy-notice-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(noticeContent);
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="notice-content">{noticeContent}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== RAW TRANSCRIPTS ===== */}
            {activeTab === "transcripts" && (
              <div className="tab-panel panel-transcripts">
                <div className="panel-header-bar">
                  <span className="panel-icon">📄</span>
                  <h3>Raw Client Transcripts</h3>
                </div>
                <div className="panel-body">
                  <pre className="transcript-content">{dossier.rawTranscripts}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
