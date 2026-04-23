import html2pdf from "html2pdf.js";

export function exportCounselPdf(dossier) {
  if (!dossier) return;

  const container = document.createElement("div");
  container.style.fontFamily = "'Georgia', 'Times New Roman', serif";
  container.style.color = "#1a1a1a";
  container.style.lineHeight = "1.75";
  container.style.maxWidth = "750px";
  container.style.margin = "0 auto";

  /**
   * Converts raw AI-generated text (with markdown-ish formatting) into
   * clean, styled HTML suitable for a professional legal PDF.
   */
  const formatLegalText = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold headings like **Statement of Facts**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Numbered items: 1. Text  →  styled list item (simplified for stability)
      .replace(/^(\d+)\.\s+(.+)$/gm,
        '<div style="margin:10px 0;padding-left:24px;text-indent:-24px;page-break-inside:avoid;"><strong>$1.</strong> &nbsp; $2</div>')
      // Bullet items: * Text or - Text
      .replace(/^[\*\-]\s+(.+)$/gm,
        '<div style="margin:10px 0;padding-left:24px;text-indent:-24px;page-break-inside:avoid;"><span style="color:#8b7033;">•</span> &nbsp; $1</div>')
      // Section-style lines that are all-caps or look like headers
      .replace(/^((?:Statement of Facts|Statutory Analysis|Prima Facie|Legal Theme|Relevant|What You Should|Where to Approach|Strategic Notice|Conclusion)[^\n]*)/gim,
        '<p style="font-weight:700;font-size:15px;margin:22px 0 10px 0;color:#1a1a1a;border-bottom:1px solid #eee;padding-bottom:6px;page-break-after:avoid;">$1</p>')
      // Double newlines → new paragraph
      .replace(/\n\n/g, '</p><p style="margin:10px 0;page-break-inside:avoid;">')
      // Single newlines → line break
      .replace(/\n/g, '<br />');
  };

  /**
   * Formats the raw transcripts section — clean but clearly distinguished
   * from the legal brief using a lighter style.
   */
  const formatTranscripts = (text) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Chat section dividers: --- Chat: Title ---
      .replace(/^--- Chat: (.+?) ---$/gm,
        '<div style="margin:28px 0 14px 0;padding:10px 16px;background:#f5f0e8;border-left:4px solid #c9a84c;border-radius:0 6px 6px 0;font-weight:700;font-size:13px;color:#333;">📋 $1</div>')
      // Role labels: [USER]: and [ASSISTANT]:
      .replace(/\[USER\]:\s*/g,
        '<div style="margin:10px 0 2px 0;font-size:11px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Client Query</div><div style="margin:0 0 10px 0;padding:8px 14px;background:#fafafa;border-radius:6px;font-size:12.5px;line-height:1.6;color:#333;">')
      .replace(/\[ASSISTANT\]:\s*/g,
        '</div><div style="margin:10px 0 2px 0;font-size:11px;font-weight:700;color:#8b7033;text-transform:uppercase;letter-spacing:1px;">NyayBot Response</div><div style="margin:0 0 14px 0;padding:8px 14px;background:#fffdf5;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0;font-size:12.5px;line-height:1.6;color:#1a1a1a;">')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Truncation markers
      .replace(/\.\.\.\[TRUNCATED_EARLIER_CHATS\]\.\.\./g,
        '<div style="text-align:center;color:#999;font-size:11px;font-style:italic;margin:16px 0;">— Earlier transcripts truncated for brevity —</div>')
      // Numbered items
      .replace(/^(\d+)\.\s+(.+)$/gm,
        '<div style="margin:6px 0;padding-left:20px;text-indent:-20px;page-break-inside:avoid;"><strong>$1.</strong> &nbsp; $2</div>')
      // Double newlines → space
      .replace(/\n\n/g, '</div><div style="margin:4px 0;">')
      // Single newlines
      .replace(/\n/g, '<br />');
  };

  const date = new Date(dossier.metadata.exportDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  // ========== TITLE PAGE ==========
  const titlePage = `
    <div style="text-align:center;padding:60px 40px 40px 40px;">
      <div style="border:2px solid #1a1a1a;padding:50px 40px;position:relative;">
        <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#fff;padding:0 20px;">
          <span style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#666;">NyayBot · AI Legal Aid</span>
        </div>
        <h1 style="margin:0 0 24px 0;font-size:32px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;">
          Legal Dossier Brief
        </h1>
        <div style="width:60px;height:2px;background:#c9a84c;margin:0 auto 24px auto;"></div>
        <p style="margin:0 0 8px 0;font-size:16px;color:#333;">
          Case Reference: <strong>${dossier.metadata.folderName}</strong>
        </p>
        <p style="margin:0;font-size:13px;color:#888;">
          ${date} &nbsp;|&nbsp; ${dossier.metadata.totalChats} Transcript${dossier.metadata.totalChats > 1 ? 's' : ''} Compiled
        </p>
      </div>
      <p style="margin:30px 0 0 0;font-size:11px;color:#aaa;font-style:italic;">
        Confidential — For Advocate Reference Only
      </p>
    </div>
  `;

  // ========== SECTION 1: LEGAL BRIEF ==========
  const briefSection = `
    <div style="page-break-before:always;padding:0 10px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:24px;color:#8b7033;">§</span>
        <h2 style="margin:0;font-size:18px;text-transform:uppercase;letter-spacing:1.5px;color:#1a1a1a;">Statutory Analysis &amp; Executive Summary</h2>
      </div>
      <div style="font-size:14px;text-align:left;line-height:1.8;">
        <p style="margin:0;">${formatLegalText(dossier.legalBrief)}</p>
      </div>
    </div>
  `;

  // ========== SECTION 2: RAW TRANSCRIPTS ==========
  const transcriptSection = `
    <div style="page-break-before:always;padding:0 10px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:24px;color:#8b7033;">📎</span>
        <h2 style="margin:0;font-size:18px;text-transform:uppercase;letter-spacing:1.5px;color:#1a1a1a;">Annexure: Raw Transcripts</h2>
      </div>
      <p style="font-size:12px;color:#888;font-style:italic;margin:0 0 20px 0;">
        The following is a verbatim record of all client-AI interactions in this dossier.
      </p>
      <div style="font-size:13px;line-height:1.6;font-family:'Georgia','Times New Roman',serif;">
        ${formatTranscripts(dossier.rawTranscripts)}
      </div>
    </div>
  `;

  // ========== FOOTER / DISCLAIMER ==========
  const disclaimer = `
    <div style="margin-top:50px;padding:20px 24px;border:1px solid #ddd;border-radius:4px;background:#fafafa;">
      <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;">Disclaimer</p>
      <p style="margin:0;font-size:11px;color:#888;line-height:1.6;">
        This document was auto-generated by NyayBot AI and contains general legal information compiled from user interactions.
        It does NOT constitute legal advice. For any serious legal matter, the reviewing advocate should independently verify
        all statutory references and facts presented herein. Free legal aid is available at your nearest District Legal Services Authority (DLSA).
      </p>
      <p style="margin:8px 0 0 0;font-size:10px;color:#aaa;">
        NyayBot · AI Legal Aid for India · Generated ${date}
      </p>
    </div>
  `;

  container.innerHTML = `<div style="padding:20px 30px;">${titlePage}${briefSection}${transcriptSection}${disclaimer}</div>`;

  const filename = `${dossier.metadata.folderName.replace(/\s+/g, '_')}_Legal_Brief.pdf`;

  html2pdf()
    .set({
      margin: [12, 14, 12, 14],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: '.panel-header-bar, .statute-card, .timeline-node' },
    })
    .from(container)
    .save();
}
