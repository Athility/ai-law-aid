import { useMemo, useState } from "react";
import "./Dashboard.css";

const CATEGORY_MAP = {
  property: ["Eviction Notice", "Security Deposit Recovery", "Draft Lease Agreement", "RERA Complaints"],
  criminal: ["FIR Procedure", "Bail Application", "Legal Rights on Arrest", "Cybercrime Reporting"],
  tax: ["Income Tax Saving (80C)", "GSTR-1 Filing Guide", "ITR Response Drafting", "GST Audit Help"],
  family: ["Domestic Violence Protection", "Divorce/Maintenance Filing", "Child Custody Rights", "Property Succession"],
  corporate: ["Breach of Contract", "NDA Drafting", "MSME Claim Filing", "Partnership Dispute"],
  general: ["Public Interest Litigation", "Consumer Court Case", "Right to Information", "Legal Aid Resources"]
};

export default function Dashboard({ history, user, onSelectChat }) {
  const stats = useMemo(() => {
    const totalChats = history.length;
    let totalMessages = 0;
    const modeCounts = { basic: 0, advanced: 0, deep: 0 };
    const categoriesFound = { property: 0, criminal: 0, tax: 0, family: 0, corporate: 0 };

    history.forEach((chat, index) => {
      totalMessages += (chat.messages?.length || 0);
      const mode = chat.analysisMode || "basic";
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;

      // Extract category from first user message - more robust keywords
      const firstMsg = chat.messages?.find(m => m.role === "user")?.content?.toLowerCase() || "";
      
      // WEIGHTED LOGIC: Newer chats (index < 3) count more for the "Horizon"
      const weight = index < 3 ? 3 : 1; 

      if (firstMsg.match(/rent|landlord|flat|deposit|house|eviction|lease/)) {
        categoriesFound.property += weight;
      } else if (firstMsg.match(/violence|assault|abuse|domestic|divorce|wife|husband|marriage|custody|child/)) {
        categoriesFound.family += weight;
      } else if (firstMsg.match(/fir|police|theft|arrest|crime|fraud|cheated|hacked/)) {
        categoriesFound.criminal += weight;
      } else if (firstMsg.match(/tax|income|gst|audit|80c|salary|employer|paid/)) {
        categoriesFound.tax += weight;
      } else if (firstMsg.match(/contract|agreement|breach|compete|partnership|nda|ipr/)) {
        categoriesFound.corporate += weight;
      }
    });

    // Find dominant category for horizon
    let dominant = "general";
    let maxCount = 0;
    Object.entries(categoriesFound).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = cat;
      }
    });

    const assistantMsgs = Math.floor(totalMessages / 2);
    const hoursSaved = (assistantMsgs * 15) / 60;
    const feesSaved = assistantMsgs * 2500;

    return { 
      totalChats, 
      totalMessages, 
      modeCounts, 
      hoursSaved: hoursSaved.toFixed(1),
      feesSaved: feesSaved.toLocaleString("en-IN"),
      dominant,
      recommendations: CATEGORY_MAP[dominant]
    };
  }, [history]);

  const [expandedChatId, setExpandedChatId] = useState(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);

  const getChatCategory = (chat) => {
    const firstMsg = chat.messages?.find(m => m.role === "user")?.content?.toLowerCase() || "";
    if (firstMsg.match(/rent|landlord|flat|deposit|house|eviction|lease/)) return "property";
    if (firstMsg.match(/violence|assault|divorce|wife|husband|marriage|domestic|custody|child/)) return "family";
    if (firstMsg.match(/fir|police|theft|arrest|crime|fraud|cheated|hacked/)) return "criminal";
    if (firstMsg.match(/tax|income|gst|audit|80c|salary|employer|paid/)) return "tax";
    if (firstMsg.match(/contract|agreement|breach|compete|partnership|nda|ipr/)) return "corporate";
    return "general";
  };

  const getChatSummary = (chat) => {
    const aiMsgs = chat.messages?.filter(m => m.role === "assistant") || [];
    if (aiMsgs.length === 0) return "No AI insights generated yet. Continue the conversation to receive a strategy.";
    return aiMsgs[aiMsgs.length - 1].content.replace(/[#*]/g, ""); // strip markdown roughly
  };

  return (
    <div className="dashboard-scroll-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || "Legal Explorer"}</h1>
          <p>Your Intelligence Dashboard & Legal Impact Summary</p>
        </div>

      <div className="dashboard-grid">
        {/* IMPACT TRACKER */}
        <div className="dashboard-card impact-card">
          <div className="card-title">🚀 IMPACT TRACKER</div>
          <div className="impact-grid">
            <div className="impact-stat">
              <span className="stat-value">{stats.hoursSaved}h</span>
              <span className="stat-label">Consultation Time Saved</span>
            </div>
            <div className="impact-stat">
              <span className="stat-value">₹{stats.feesSaved}</span>
              <span className="stat-label">Est. Legal Fees Saved</span>
            </div>
          </div>
        </div>

        {/* ENCRYPTION SHIELD */}
        <div className="dashboard-card encryption-card">
          <div className="shield-container">
            <div className="shield-pulse"></div>
            <span className="shield-icon">🛡️</span>
          </div>
          <div className="encryption-status">Zero-Knowledge Active</div>
          <p className="encryption-desc">
            All your legal data is AES-256 encrypted on your device. 
            NyayBot cannot read your private chats.
          </p>
        </div>

        {/* INTELLIGENCE MIX */}
        <div className="dashboard-card intelligence-card">
          <div className="card-title">📊 INTELLIGENCE MIX (CHATS)</div>
          <div className="intelligence-list">
            <div className="intel-item basic">
              <div className="intel-header">
                <span className="intel-name">⚡ Basic Intelligence</span>
                <span className="intel-count">{stats.modeCounts.basic}</span>
              </div>
              <p className="intel-suggestion">Quick legal awareness. Suggestion: Use Advanced for case precedents.</p>
            </div>
            <div className="intel-item advanced">
              <div className="intel-header">
                <span className="intel-name">🔍 Advanced Analysis</span>
                <span className="intel-count">{stats.modeCounts.advanced}</span>
              </div>
              <p className="intel-suggestion">Detailed legal database search and section cross-referencing.</p>
            </div>
            <div className="intel-item deep">
              <div className="intel-header">
                <span className="intel-name">💎 Deep Strategy</span>
                <span className="intel-count">{stats.modeCounts.deep}</span>
              </div>
              <p className="intel-suggestion">Success: Using our most powerful strategic intelligence engine.</p>
            </div>
          </div>
        </div>

        {/* LEGAL HORIZON */}
        <div className="dashboard-card horizon-card">
          <div className="card-title">🌟 YOUR LEGAL HORIZON</div>
          <p className="encryption-desc" style={{ marginBottom: '20px', maxWidth: '100%' }}>
            Based on your activity in <strong>{stats.dominant.toUpperCase()} LAW</strong>, here is what you can search more:
          </p>
          <div className="horizon-list">
            {stats.recommendations.map((rec, i) => (
              <span key={i} className="horizon-tag">{rec}</span>
            ))}
          </div>
        </div>

        {/* CHAT-WISE ANALYSIS */}
        <div className="dashboard-card sessions-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">📝 RECENT CHAT-WISE ANALYSIS</div>
          {history.length === 0 ? (
            <p className="encryption-desc">No sessions yet.</p>
          ) : (
            <div className="sessions-list">
              {history.slice(0, 5).map(chat => {
                const mode = chat.analysisMode || "basic";
                const isExpanded = expandedChatId === chat.id;
                const chatCat = getChatCategory(chat);
                const chatRecs = CATEGORY_MAP[chatCat];
                
                return (
                  <div key={chat.id} className={`session-wrapper ${isExpanded ? 'expanded' : ''}`}>
                    <div 
                      className="session-row" 
                      onClick={() => setExpandedChatId(isExpanded ? null : chat.id)}
                    >
                      <div className="session-info">
                        <span className="session-icon">{isExpanded ? '📂' : '💬'}</span>
                        <span className="session-title">{chat.title || "New Chat"}</span>
                      </div>
                      <div className={`session-badge badge-${mode}`}>
                        {mode === "deep" ? "💎 Deep Mode" : mode === "advanced" ? "🔍 Advanced Mode" : "⚡ Basic Mode"}
                      </div>
                      <div className="session-meta">
                        {chat.messages?.length || 0} msgs
                        <span className="expand-indicator">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="session-dropdown">
                        <div className="dropdown-section">
                          <h4 className="dropdown-title">AI Summary Snippet</h4>
                          <div className="dropdown-text-container">
                            <p className="dropdown-text">
                              {expandedSummaryId === chat.id 
                                ? getChatSummary(chat) 
                                : (getChatSummary(chat).substring(0, 180) + (getChatSummary(chat).length > 180 ? "..." : ""))
                              }
                            </p>
                            {getChatSummary(chat).length > 180 && (
                              <button 
                                className="show-toggle" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedSummaryId(expandedSummaryId === chat.id ? null : chat.id);
                                }}
                              >
                                {expandedSummaryId === chat.id ? "Show Less" : "Show More"}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="dropdown-section">
                          <h4 className="dropdown-title">Chat Legal Horizon ({chatCat.toUpperCase()})</h4>
                          <div className="horizon-list mini">
                            {chatRecs.map((rec, i) => (
                              <span key={i} className="horizon-tag mini-tag">{rec}</span>
                            ))}
                          </div>
                        </div>
                        <div className="dropdown-footer">
                          <button className="open-chat-action" onClick={() => onSelectChat(chat.id)}>
                            Open Chat Session
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
