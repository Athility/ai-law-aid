<div align="center">

# 🗺 NyayBot — Product Roadmap

A phased plan to evolve NyayBot from a hackathon prototype into a **full-scale legal empowerment platform** for India.

</div>

---

## 📌 How to Read This Roadmap

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔨 | In Progress |
| 📋 | Planned |
| 💭 | Under Consideration |

---

## Phase 1 — MVP (Hackathon) `✅ COMPLETE`

> **Goal:** Prove the concept — an AI that explains Indian law in plain language.

| Status | Feature | Details |
|--------|---------|---------|
| ✅ | Chat Interface | Full conversational UI with auto-scroll, typing indicator |
| ✅ | Claude AI Integration | Sonnet 4 model with Indian law system prompt |
| ✅ | Structured Responses | Every reply includes: rights, laws/sections, next steps, authority to approach |
| ✅ | Bilingual Input | Accept both English and Hindi queries |
| ✅ | Example Queries | 6 pre-built legal scenarios (tenant, consumer, labour, family, cyber, RERA) |
| ✅ | Responsive Design | Works on mobile, tablet, and desktop |
| ✅ | Privacy First | Zero data storage — nothing is logged or persisted |
| ✅ | Health Check API | `GET /api/health` endpoint for monitoring |

---

## Phase 2 — Enhanced UX `✅ COMPLETE`

> **Goal:** Make the app more usable and polished for real-world users.

| Status | Feature | Details |
|--------|---------|---------|
| ✅ | **Dark / Light Mode** | System-aware theme toggle with smooth transitions |
| ✅ | **Chat History** | Persist conversations in `localStorage`, revisit past sessions |
| ✅ | **PDF Export** | Download any legal guidance as a formatted PDF (html2pdf.js) |
| ✅ | **Markdown Rendering** | Render bold, lists, and sections properly |
| ✅ | **Copy to Clipboard** | One-click copy for any bot response |
| ✅ | **New Chat Button** | Clear current conversation and start fresh |
| ✅ | **Loading Skeleton** | Shimmer states replacing typing indicators |
| ✅ | **Keyboard Shortcuts** | `Ctrl+N` new chat, `Ctrl+L` clear, `/` focus input |

---

## Phase 3 — Voice & Accessibility `✅ COMPLETE`

> **Goal:** Break language barriers and enable hands-free interaction.
> **Priority Focus:** 🔴 Voice Input & Regional UI

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **Voice Input** | Speech-to-text supporting English and **Regional Languages** (Hindi, Marathi, etc.) | 🔴 High |
| 📋 | **Hindi & Marathi UI** | Full interface translated for regional comfort | 🔴 High |
| 📋 | **Text-to-Speech** | AI speaks responses for low-literacy accessibility | 🟡 Medium |
| 📋 | **Font Size Controls** | Accessibility zoom for elderly users | 🟡 Medium |
| 📋 | **Screen Reader Support** | Full ARIA labels and semantic HTML | 🟡 Medium |

---

## Phase 4 — Deep Intelligence `✅ COMPLETE`

> **Goal:** Granular control over analysis depth and precision.
> **Priority Focus:** 🔴 3-Mode Analysis Architecture

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **3 Analysis Modes** | **Basic:** Fastest response, no legal db usage.<br>**Advanced:** Medium fast, minimal db cross-check.<br>**Deep Analysis:** Peak cross-checking with full legal database. | 🔴 High |
| 📋 | **RAG Pipeline** | Real-time retrieval from Indian Kanoon / Bare Acts | 🔴 High |
| 📋 | **Case Law Refs** | Citation of Supreme Court / High Court judgments | 🔴 High |
| 📋 | **State-Specific Laws** | Jurisdiction-aware guidance (e.g., State Acts) | 🔴 High |
| 📋 | **Legal Templates** | Generate drafts for FIRs, legal notices, etc. | 🟡 Medium |

---

## Phase 5 — Visual & Document Intelligence `📋 PLANNED`

> **Goal:** Understanding physical evidence and documents.
> **Priority Focus:** 🔴 Multimodal Evidence Processing

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **Image Input** | Upload photos of disputes, handwritten notes, or chat screenshots. AI analyzes them in context of the chat. | 🔴 High |
| 📋 | **Document Reader** | Support for PDF and .docx uploads. AI extracts text and analyzes images within these documents. | 🔴 High |
| 📋 | **Evidence Summary** | Automated extraction of key facts from visual/doc evidence. | 🟡 Medium |

---

## Phase 6 — Reach & Community `📋 PLANNED`

> **Goal:** Expand distribution beyond the web app.

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **WhatsApp Bot** | Serve legal guidance via WhatsApp (Twilio/Meta API) | 🔴 High |
| 📋 | **Telegram Bot** | Alternative messaging platform integration | 🟡 Medium |
| 📋 | **PWA Support** | Installable mobile experience | 🔴 High |
| 📋 | **Nearby Legal Aid** | Map-based finder for Law offices and DLSA centers | 🟡 Medium |
| 📋 | **Lawyer Connect** | Connect users to verified pro-bono lawyers | 🟡 Medium |

---

## Phase 7 — Scale & Sustainability `🔨 IN PROGRESS`

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| ✅ | **User Authentication** | Google One-Tap / Social sign-in implemented | 🔴 High |
| ✅ | **Local Inference Engine**| 100% Local, private AI infrastructure (Llama 3) | 🔴 High |
| 📋 | **Analytics Dashboard** | Identify common legal trends and impact metrics | 🔴 High |
| 📋 | **Rate Limiting** | Professional API security and abuse prevention | 🔴 High |
| 📋 | **Database Sync** | Secure PostgreSQL/MongoDB for persistent storage | 🟡 Medium |
| 📋 | **Admin Panel** | Manage system prompts and AI quality monitoring | 🟡 Medium |

---

## 🎯 Success Metrics

| Metric | Phase 1 Target | Long-Term Goal |
|--------|----------------|----------------|
| **Monthly Active Users** | 100 | 100,000+ |
| **Average Response Quality** | Manual review | 4.5+ / 5 user rating |
| **Languages Supported** | 2 (EN, HI) | 10+ Indian languages |
| **Legal Domains Covered** | 6 | 15+ |
| **Avg Response Time** | < 10s | < 5s |
| **Uptime** | 95% | 99.9% |

---

## 🤝 Want to Contribute?

Pick any `📋 Planned` item from this roadmap, open an issue, and submit a PR!

See [README.md](README.md) for setup instructions and contribution guidelines.

---

<div align="center">

*Last updated: April 2026*

**NyayBot** — Bridging India's Justice Gap with AI ⚖

</div>
