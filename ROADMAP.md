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

## Phase 2 — Enhanced UX `📋 PLANNED`

> **Goal:** Make the app more usable and polished for real-world users.
>
> **Timeline:** 2–4 weeks post-hackathon

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **Dark / Light Mode** | System-aware theme toggle with smooth transitions | 🔴 High |
| 📋 | **Chat History** | Persist conversations in `localStorage`, allow revisiting past sessions | 🔴 High |
| 📋 | **PDF Export** | Download any legal guidance as a formatted PDF document | 🔴 High |
| 📋 | **Markdown Rendering** | Render bold, lists, and sections properly in chat bubbles | 🟡 Medium |
| 📋 | **Copy to Clipboard** | One-click copy for any bot response | 🟡 Medium |
| 📋 | **New Chat Button** | Clear current conversation and start fresh | 🟡 Medium |
| 📋 | **Loading Skeleton** | Better loading states beyond the typing indicator | 🟢 Low |
| 📋 | **Keyboard Shortcuts** | `Ctrl+N` new chat, `Ctrl+L` clear, `Ctrl+K` search history | 🟢 Low |

---

## Phase 3 — Language & Accessibility `📋 PLANNED`

> **Goal:** Make NyayBot accessible to all of India — not just English speakers.
>
> **Timeline:** 1–2 months

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **Hindi UI** | Full interface translated into Hindi with toggle switch | 🔴 High |
| 📋 | **Marathi UI** | Interface in Marathi for Maharashtra users | 🟡 Medium |
| 📋 | **Voice Input** | Speech-to-text using Web Speech API for hands-free queries | 🔴 High |
| 📋 | **Text-to-Speech** | Read out legal guidance aloud for low-literacy users | 🟡 Medium |
| 📋 | **Regional Languages** | Tamil, Telugu, Bengali, Gujarati, Kannada UI support | 🟢 Low |
| 📋 | **Font Size Controls** | Accessibility zoom for elderly users | 🟡 Medium |
| 📋 | **Screen Reader Support** | Full ARIA labels and semantic HTML | 🟡 Medium |

---

## Phase 4 — Intelligence Layer `📋 PLANNED`

> **Goal:** Make the AI smarter, more accurate, and more contextually aware.
>
> **Timeline:** 2–3 months

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 📋 | **RAG Pipeline** | Retrieve actual legal text from Indian Kanoon / bare acts before answering | 🔴 High |
| 📋 | **Case Law References** | Cite relevant Supreme Court / High Court judgments | 🔴 High |
| 📋 | **State-Specific Laws** | Ask for user's state to provide jurisdiction-specific guidance | 🔴 High |
| 📋 | **Legal Document Templates** | Generate FIR drafts, consumer complaints, legal notices | 🟡 Medium |
| 📋 | **Follow-Up Suggestions** | AI suggests next questions based on the user's situation | 🟡 Medium |
| 📋 | **Confidence Scoring** | Show how confident the AI is in its legal guidance | 🟢 Low |
| 📋 | **Multi-Model Support** | Fallback between Claude, GPT, Gemini for reliability | 🟢 Low |

---

## Phase 5 — Community & Distribution `💭 UNDER CONSIDERATION`

> **Goal:** Reach users where they are — beyond just a web app.
>
> **Timeline:** 3–6 months

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 💭 | **WhatsApp Bot** | Serve legal guidance via WhatsApp (Twilio / Meta API) | 🔴 High |
| 💭 | **Telegram Bot** | Alternative messaging platform integration | 🟡 Medium |
| 💭 | **PWA Support** | Installable as a Progressive Web App on mobile | 🔴 High |
| 💭 | **Nearby Legal Aid Centers** | Map-based finder for DLSA offices and legal aid clinics | 🟡 Medium |
| 💭 | **Lawyer Connect** | Connect users to pro-bono lawyers for complex cases | 🟡 Medium |
| 💭 | **Community Forum** | User Q&A where resolved cases help others | 🟢 Low |
| 💭 | **NGO Dashboard** | Admin panel for legal aid organizations to track impact | 🟢 Low |

---

## Phase 6 — Scale & Sustainability `💭 UNDER CONSIDERATION`

> **Goal:** Make NyayBot sustainable and production-grade.
>
> **Timeline:** 6–12 months

| Status | Feature | Details | Priority |
|--------|---------|---------|----------|
| 💭 | **User Authentication** | Optional accounts for saved history and personalized guidance | 🟡 Medium |
| 💭 | **Analytics Dashboard** | Track most common legal queries, regional trends, impact metrics | 🔴 High |
| 💭 | **Rate Limiting & Abuse Prevention** | Protect the API from spam and misuse | 🔴 High |
| 💭 | **Database Integration** | PostgreSQL/MongoDB for persistent storage (opt-in by user) | 🟡 Medium |
| 💭 | **Admin Panel** | Manage system prompts, monitor usage, review AI quality | 🟡 Medium |
| 💭 | **API for Partners** | Public API for NGOs, legal tech companies, government portals | 🟢 Low |
| 💭 | **Offline Mode** | Cached common legal FAQs available without internet | 🟢 Low |
| 💭 | **Open Source Legal Dataset** | Curated Indian law knowledge base as a public resource | 💭 Exploring |

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
