<div align="center">

# ⚖ NyayBot

### Your Friendly AI Law Helper for India

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

NyayBot is your **Friendly AI Law Helper** — a professional, premium legal aid platform designed to help Indian citizens navigate the complexities of Indian Law with empathy and clarity. No jargon, no fees, no barriers.

[Get Started](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [Deploy](#-deployment) · [Contribute](#-contributing)

</div>

---

## 🎯 The Problem

> **80% of India's population** cannot afford a lawyer. There are only ~1.4 million advocates for 1.4 billion people. Most citizens have **no idea what their rights are** when faced with tenant disputes, wage theft, consumer fraud, or domestic violence.

**NyayBot bridges this justice gap** by providing instant, structured, AI-generated legal guidance covering key Indian laws — for free.

---

| Feature | Description |
|---|---|
| 🤝 **Friendly Persona** | Designed as an empathetic "Law Helper" to make legal aid approachable |
| 🗄 **Modern Sidebar** | Slide-out navigation for chat history and quick legal scenarios |
| 🏔 **Floating Header** | Universal floating anchor for branding and theme controls |
| 💊 **Pill-Box Input** | Unified, spacious input architecture with Ghost-UI tool buttons |
| ⚖ **Indian Law Coverage** | Tenant law, consumer protection, labour law, family law, cyber crime, criminal law, RERA |
| 🇮🇳 **Bilingual Support** | Describe your problem in English, Hindi, or the language of your choice |
| 🎤 **Voice & File Tools** | Integrated voice-to-text and document attachment capabilities |
| 🔒 **Privacy First** | Zero data storage — no user data is saved or logged |
| ⚡ **Dynamic Scaling** | Smart input bar that expands width and height based on your prompt length |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         USER (Browser)                       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │              React Frontend (Vite)                   │   │
│   │  • Premium Layout (Sidebar + Floating Header)        │   │
│   │  • Dynamic Pill-Box Input                            │   │
│   │  • Voice & File Integration                          │   │
│   └────────────────────┬─────────────────────────────────┘   │
│                        │  POST /api/chat                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Environment: ANTHROPIC_API_KEY, PORT                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │   Anthropic API    │
              │   Claude Sonnet 4  │
              └────────────────────┘
```

---

## 🗂 Project Structure

```
ai-legal-aid/
│
├── src/                        # React frontend source
├── api/                        # Express proxy handlers
├── python_engine/              # Vector DB & AI Logic (FastAPI)
├── public/                     # Static assets & PWA manifest
├── vite.config.js              # Vite configuration
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ — [Download here](https://nodejs.org)
- **Anthropic API Key** — [Get one here](https://console.anthropic.com) (starts with `sk-ant-...`)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-legal-aid.git
cd ai-legal-aid
```

### 2. Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
PORT=3001
```

Start the server:

```bash
npm run dev
```

> ✅ You should see: `NyayBot backend running on http://localhost:3001`

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> ✅ You should see Vite running at: `http://localhost:5173`

### 4. Open NyayBot

Navigate to **http://localhost:5173** in your browser. You're ready to go! 🎉

---

---

## 🕒 Latest Updates (Hackathon Sprint)

| Feature | Description | Status |
|---|---|---|
| **Local Inference** | Switched from Claude API to **100% Local Inference**. Llama-3 now runs locally on the edge via `llama-cpp-python`. No API costs, total privacy. | ✅ Done |
| **Google Sign-In** | Migrated from Phone.email OTP to **Google Identity Services (GIS)**. 1-tap login for a smoother onboarding experience. | ✅ Done |
| **OCR & Vision** | Implemented a Python OCR bridge to extract text from legal documents (PDFs/Images) uploaded by users. | ✅ Done |
| **Premium Mobile UI** | Full glassmorphism redesign with a responsive side-drawer, sticky tool-headers, and smooth thread animations. | ✅ Done |
| **Voice Interaction** | Added voice-to-text input supporting regional accents and multi-modal interaction. | ✅ Done |

---

## 🏗 Updated Architecture

NyayBot now uses a **3-tier Local Architecture** to comply with the "build these yourself" hackathon rules:

1. **The Brain (Python/FastAPI)**: Loads the GGUF model (Llama-3) using hardware acceleration (CUDA/Metal).
2. **The Bridge (Node.js/Express)**: Manages sessions, system prompts, and acts as a security proxy.
3. **The UI (React/Vite)**: A premium, mobile-first interface for civilian legal aid.

---

## 🚀 Presentation Mode

To launch the demo, follow the **[HACKATHON_RUNBOOK.md](HACKATHON_RUNBOOK.md)**. It requires starting the Brain, the Bridge, and the UI in three separate terminals.

---

<div align="center">

Built with ❤ for **Hackathon 2026** — Bridging India's Justice Gap.

⚖ *Nyay (न्याय) = Justice*

</div>
