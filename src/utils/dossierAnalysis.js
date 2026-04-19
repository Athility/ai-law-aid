/**
 * Dossier Analysis Utilities
 * Extracts structured intelligence from JRF dossier data for the Advocate Portal.
 */

// ==================== STATUTE & PRECEDENT LINKER ====================

const STATUTE_PATTERNS = [
  // "Section 420 of the IPC" / "Section 420 IPC" / "Section 420, IPC"
  { regex: /Section\s+(\d+[A-Z]?(?:\s*\/\s*\d+[A-Z]?)*)\s*(?:of\s+(?:the\s+)?)?(?:,\s*)?(IPC|Indian Penal Code|BNS|Bharatiya Nyaya Sanhita|CrPC|Code of Criminal Procedure|CPC|Code of Civil Procedure|IT Act|Information Technology Act|RERA|Consumer Protection Act|POCSO|Domestic Violence Act|Motor Vehicles Act|NI Act|Negotiable Instruments Act)/gi,
    type: "section"
  },
  // "Article 14" / "Article 21" (Constitutional)
  { regex: /Article\s+(\d+[A-Z]?)\s*(?:of\s+(?:the\s+)?Constitution)?/gi, type: "article" },
  // "under the XYZ Act, 20XX"
  { regex: /under\s+(?:the\s+)?([\w\s]+Act(?:,?\s*\d{4})?)/gi, type: "act" },
  // Standalone IPC/BNS/CrPC references with section numbers
  { regex: /(?:IPC|BNS|CrPC|CPC)\s+(?:Section\s+)?(\d+[A-Z]?)/gi, type: "code_ref" },
];

const INDIAN_KANOON_BASE = "https://indiankanoon.org/search/?formInput=";

export function extractStatutes(text) {
  if (!text) return [];
  const found = new Map(); // Use map to deduplicate

  STATUTE_PATTERNS.forEach(({ regex, type }) => {
    let match;
    const re = new RegExp(regex.source, regex.flags); // Clone regex
    while ((match = re.exec(text)) !== null) {
      const fullMatch = match[0].trim();
      const key = fullMatch.toLowerCase().replace(/\s+/g, ' ');
      if (!found.has(key)) {
        found.set(key, {
          id: key,
          text: fullMatch,
          type,
          section: match[1] || "",
          act: match[2] || "",
          searchUrl: INDIAN_KANOON_BASE + encodeURIComponent(fullMatch),
        });
      }
    }
  });

  return Array.from(found.values());
}

// ==================== CASE ANALYTICS / AUDIT TRAIL ====================

const URGENCY_KEYWORDS = [
  "emergency", "arrest", "threat", "violence", "harass",
  "eviction", "assault", "abuse", "kidnap", "murder",
  "rape", "dowry", "extort", "blackmail", "urgent",
  "immediately", "fir", "police", "bail", "custody",
  "life threatening", "danger", "death", "suicide",
];

const GRIEVANCE_KEYWORDS = [
  "cheated", "fraud", "scam", "stolen", "lost money",
  "not paid", "salary", "rent", "landlord", "tenant",
  "employer", "dismissed", "terminated", "accident",
  "defective", "refund", "compensation", "damages",
  "harassment", "discrimination", "unfair", "illegal",
  "property", "dispute", "divorce", "maintenance",
  "alimony", "child custody", "domestic violence",
];

const SENTIMENT_POSITIVE = ["thank", "grateful", "helped", "understand", "clear", "appreciate"];
const SENTIMENT_NEGATIVE = ["scared", "worried", "confused", "angry", "frustrated", "helpless", "desperate", "afraid", "anxious", "stressed"];

export function analyzeDossier(dossier) {
  const { rawTranscripts, legalBrief, metadata } = dossier;
  const fullText = (rawTranscripts + " " + legalBrief).toLowerCase();
  const userMessages = [];
  const botMessages = [];

  // Parse messages from raw transcripts
  const lines = (rawTranscripts || "").split("\n");
  let currentRole = null;
  let currentMsg = "";

  lines.forEach(line => {
    if (line.startsWith("[USER]:")) {
      if (currentRole === "user" && currentMsg) userMessages.push(currentMsg.trim());
      if (currentRole === "assistant" && currentMsg) botMessages.push(currentMsg.trim());
      currentRole = "user";
      currentMsg = line.replace("[USER]:", "").trim();
    } else if (line.startsWith("[ASSISTANT]:")) {
      if (currentRole === "user" && currentMsg) userMessages.push(currentMsg.trim());
      if (currentRole === "assistant" && currentMsg) botMessages.push(currentMsg.trim());
      currentRole = "assistant";
      currentMsg = line.replace("[ASSISTANT]:", "").trim();
    } else {
      currentMsg += " " + line;
    }
  });
  // Push last message
  if (currentRole === "user" && currentMsg) userMessages.push(currentMsg.trim());
  if (currentRole === "assistant" && currentMsg) botMessages.push(currentMsg.trim());

  // Urgency Score (0-100)
  let urgencyHits = 0;
  URGENCY_KEYWORDS.forEach(kw => {
    if (fullText.includes(kw)) urgencyHits++;
  });
  const urgencyScore = Math.min(100, Math.round((urgencyHits / 8) * 100));

  // Sentiment
  let positiveHits = 0;
  let negativeHits = 0;
  const userText = userMessages.join(" ").toLowerCase();
  SENTIMENT_POSITIVE.forEach(kw => { if (userText.includes(kw)) positiveHits++; });
  SENTIMENT_NEGATIVE.forEach(kw => { if (userText.includes(kw)) negativeHits++; });

  let sentiment = "Neutral";
  if (negativeHits > positiveHits + 1) sentiment = "Distressed";
  else if (negativeHits > positiveHits) sentiment = "Anxious";
  else if (positiveHits > negativeHits) sentiment = "Cooperative";

  // Key Grievances
  const grievances = [];
  GRIEVANCE_KEYWORDS.forEach(kw => {
    if (fullText.includes(kw)) {
      grievances.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  // Legal themes detected from the brief
  const themes = [];
  const themePatterns = [
    { pattern: /consumer/i, label: "Consumer Protection" },
    { pattern: /tenant|landlord|rent|eviction/i, label: "Tenancy & Property" },
    { pattern: /employment|employer|salary|termination/i, label: "Labour & Employment" },
    { pattern: /cyber|online|internet|hack/i, label: "Cyber Crime" },
    { pattern: /domestic violence|dowry|matrimonial/i, label: "Domestic & Family" },
    { pattern: /fraud|cheat|scam|misrepresent/i, label: "Fraud & Cheating" },
    { pattern: /accident|motor|vehicle/i, label: "Motor Vehicle & Accident" },
    { pattern: /property|land|real estate|rera/i, label: "Real Estate & Property" },
    { pattern: /criminal|fir|police|arrest/i, label: "Criminal Law" },
    { pattern: /constitution|fundamental|article/i, label: "Constitutional Rights" },
  ];
  themePatterns.forEach(({ pattern, label }) => {
    if (pattern.test(fullText)) themes.push(label);
  });

  return {
    totalExchanges: userMessages.length,
    userMessageCount: userMessages.length,
    botMessageCount: botMessages.length,
    avgUserMsgLength: userMessages.length > 0
      ? Math.round(userMessages.reduce((a, m) => a + m.length, 0) / userMessages.length)
      : 0,
    urgencyScore,
    urgencyLabel: urgencyScore > 70 ? "HIGH" : urgencyScore > 35 ? "MEDIUM" : "LOW",
    sentiment,
    grievances: grievances.slice(0, 8),
    themes: themes.length > 0 ? themes : ["General Legal Inquiry"],
    statutes: extractStatutes(legalBrief),
  };
}

// ==================== TIMELINE EXTRACTOR ====================

export function extractTimeline(dossier) {
  const { rawTranscripts, legalBrief } = dossier;
  const events = [];

  // Extract from chat titles (--- Chat: Title ---)
  const chatMatches = (rawTranscripts || "").matchAll(/--- Chat: (.+?) ---/g);
  let chatIndex = 1;
  for (const m of chatMatches) {
    events.push({
      order: chatIndex,
      type: "session",
      label: `Consultation Session ${chatIndex}`,
      detail: m[1],
      icon: "💬",
    });
    chatIndex++;
  }

  // Extract date references from text
  const combinedText = (rawTranscripts || "") + "\n" + (legalBrief || "");
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{2,4})/gi,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})/gi,
  ];

  const dateSet = new Set();
  datePatterns.forEach(re => {
    let match;
    const regex = new RegExp(re.source, re.flags);
    while ((match = regex.exec(combinedText)) !== null) {
      const dateStr = match[1].trim();
      if (!dateSet.has(dateStr)) {
        dateSet.add(dateStr);
        events.push({
          order: 100 + dateSet.size,
          type: "date",
          label: `Date Referenced`,
          detail: dateStr,
          icon: "📅",
        });
      }
    }
  });

  // Extract key events from legal brief
  const eventPatterns = [
    { pattern: /filed\s+(?:a\s+)?(?:complaint|FIR|case|petition|suit)/gi, label: "Legal Filing", icon: "📋" },
    { pattern: /served\s+(?:a\s+)?(?:notice|summons)/gi, label: "Notice Served", icon: "📨" },
    { pattern: /arrested|detained|taken into custody/gi, label: "Arrest / Detention", icon: "🚔" },
    { pattern: /evicted|vacate|dispossess/gi, label: "Eviction Event", icon: "🏠" },
    { pattern: /agreement|contract|signed/gi, label: "Agreement / Contract", icon: "📝" },
    { pattern: /payment|transaction|transfer/gi, label: "Financial Transaction", icon: "💰" },
    { pattern: /hearing|court date|appearance/gi, label: "Court Proceeding", icon: "⚖️" },
  ];

  eventPatterns.forEach(({ pattern, label, icon }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    if (regex.test(combinedText)) {
      events.push({
        order: 200 + events.length,
        type: "event",
        label,
        detail: `Detected in dossier analysis`,
        icon,
      });
    }
  });

  // Add JRF export as final event
  events.push({
    order: 999,
    type: "milestone",
    label: "Dossier Exported",
    detail: `JRF generated on ${new Date(dossier.metadata.exportDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    icon: "🏛️",
  });

  return events.sort((a, b) => a.order - b.order);
}
