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
| ☁️ **Cloud Sync Persistence** | Securely syncs your chat history and folders across devices using Firebase/Firestore |
| 🗑️ **Total Privacy Control** | Bulk delete functionality ensures your data is completely wiped from both local storage and the cloud |
| ⚖ **Indian Law Coverage** | Tenant law, consumer protection, labour law, family law, cyber crime, criminal law, RERA |
| 🇮🇳 **10+ Regional Languages** | Unified voice dialect and AI response language sync across the entire app |
| 🎤 **Voice & OCR Tools** | Integrated voice-to-text input and document parsing via a Python vision bridge |
| 💎 **Premium UI** | Dossier Center with glassmorphism aesthetics, dynamic pill-box inputs, and responsive drawers |

---

## 🏗 Architecture

NyayBot utilizes a modern, hybrid architecture combining serverless cloud infrastructure with a powerful local/dedicated Python engine.

```
┌──────────────────────────────────────────────────────────────┐
│                         USER (Browser)                       │
│   ┌──────────────────────────────────────────────────────┐   │
│   │              React Frontend (Vite)                   │   │
│   │  • Premium Dossier Center & Chat UI                  │   │
│   │  • Voice Recognition & Unified Settings              │   │
│   └────────────────────┬───────────▲─────────────────────┘   │
└────────────────────────┼───────────┼─────────────────────────┘
            API Requests │           │ Real-time Sync
                         ▼           │
┌──────────────────────────────────────────────────────────────┐
│                  Vercel Edge API (Node.js)                   │
│  • /api/chat (Proxy)    • /api/chats, /api/folders (CRUD)    │
└─────────┬─────────────────────────────────┬──────────────────┘
          │                                 │
          ▼                                 ▼
┌────────────────────┐            ┌────────────────────┐
│   Python Engine    │            │ Firebase Firestore │
│   (Llama-3 / RAG)  │            │ (Secure Cloud DB)  │
│   • NLP Analysis   │            │ • Chat History     │
│   • OCR Processing │            │ • Folder Sync      │
└────────────────────┘            └────────────────────┘
```

---

## 🗂 Project Structure

```
ai-legal-aid/
│
├── src/                        # React frontend (UI, Hooks, Context)
├── api/                        # Vercel Serverless Functions (Node.js)
├── python_engine/              # Fast API Backend for Local LLM & OCR
├── public/                     # Static assets
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **Python** 3.10+ (for the local AI engine)
- **Firebase Project** (for cloud sync)

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/ai-legal-aid.git
cd ai-legal-aid
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
PYTHON_ENGINE_URL=http://localhost:5000/v1/chat/completions
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Run Development Servers

Refer to the **[HACKATHON_RUNBOOK.md](HACKATHON_RUNBOOK.md)** for detailed instructions on starting the Python Engine and the Vite/Node Dev Servers concurrently.

---

## 🕒 Latest Major Updates (Hackathon Sprint)

| Update | Description | Status |
|---|---|---|
| **Cloud Sync & Data Persistence** | Replaced local-only storage with **Firestore cloud sync**. Chats and folders now roam with the user's Google account across devices. | ✅ Done |
| **Complete Data Erasure** | Implemented high-performance **bulk delete** APIs (`/api/chats`, `/api/folders`) to ensure "Clear History" permanently wipes data from the cloud, fixing sync-respawn bugs. | ✅ Done |
| **Unified Linguistic Engine** | Synced the "Default AI Language" and "Voice Input Dialect" into a single robust system supporting **10 Indian languages**, seamlessly updating the UI and AI context. | ✅ Done |
| **Dossier UI Polish** | Refined the Client Dossier Center by removing cluttered background assets (glass layers, icons) for a much cleaner, professional aesthetic. | ✅ Done |
| **OCR & Vision Bridge** | Implemented a Python OCR bridge to extract text from legal documents (PDFs/Images) uploaded by users directly in the chat bar. | ✅ Done |
| **Google Identity Services** | 1-tap Google login implementation with secure JWT token verification across all API routes. | ✅ Done |

---

## 🚀 Presentation Mode

To launch the demo, follow the **[HACKATHON_RUNBOOK.md](HACKATHON_RUNBOOK.md)**. It requires starting the Brain, the Bridge, and the UI in three separate terminals.

---

<div align="center">

Built with ❤ for **Hackathon 2026** — Bridging India's Justice Gap.

⚖ *Nyay (न्याय) = Justice*

</div>
