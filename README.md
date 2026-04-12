<div align="center">

# ⚖ NyayBot

### AI Legal Aid Assistant for India

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet_4-CC785C?logo=anthropic&logoColor=white)](https://anthropic.com)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A **free, open-source** AI-powered legal aid chatbot that helps Indian citizens understand their legal rights in **plain English and Hindi** — no sign-up, no fees, no jargon.

[Get Started](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [Deploy](#-deployment) · [Contribute](#-contributing)

</div>

---

## 🎯 The Problem

> **80% of India's population** cannot afford a lawyer. There are only ~1.4 million advocates for 1.4 billion people. Most citizens have **no idea what their rights are** when faced with tenant disputes, wage theft, consumer fraud, or domestic violence.

**NyayBot bridges this justice gap** by providing instant, structured, AI-generated legal guidance covering key Indian laws — for free.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI-Powered Guidance** | Powered by Claude AI (Sonnet 4) with a carefully crafted legal system prompt |
| ⚖ **Indian Law Coverage** | Tenant law, consumer protection, labour law, family law, cyber crime, criminal law, RERA |
| 🇮🇳 **Bilingual Support** | Ask questions in English or Hindi — get structured answers |
| 📋 **Structured Responses** | Every answer includes: rights, relevant laws & sections, next steps, and where to approach |
| 🔒 **Privacy First** | Zero data storage — no user data is saved or logged |
| 📱 **Mobile Responsive** | Fully responsive UI that works seamlessly on all devices |
| ⚡ **Quick Examples** | 6 pre-built legal scenarios to get started instantly |
| 💬 **Conversational** | Full chat history for follow-up questions within a session |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         USER (Browser)                       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │              React Frontend (Vite)                   │   │
│   │  • Chat UI with sidebar + landing page               │   │
│   │  • Pre-built legal query examples                    │   │
│   │  • Auto-scrolling message stream                     │   │
│   └────────────────────┬─────────────────────────────────┘   │
│                        │  POST /api/chat                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  Express Backend (Node.js)                    │
│                                                              │
│   • Receives chat messages                                   │
│   • Injects Indian law system prompt                         │
│   • Forwards to Claude API                                   │
│   • Returns structured legal guidance                        │
│   • Health check endpoint at GET /api/health                 │
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
├── frontend/                   # React + Vite client
│   ├── src/
│   │   ├── App.jsx             # Main chat UI component
│   │   ├── App.css             # Complete application styling
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json
│
├── backend/                    # Express API server
│   ├── server.js               # API routes + Claude integration
│   ├── .env.example            # Environment variable template
│   └── package.json
│
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

## 🌐 Deployment

### Backend → [Render](https://render.com) (Free Tier)

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment Variable** | `ANTHROPIC_API_KEY` = your key |

After deployment, note your backend URL (e.g. `https://nyaybot-backend.onrender.com`).

### Frontend → [Vercel](https://vercel.com) (Free Tier)

1. Import your GitHub repo on Vercel
2. Set **Root Directory** to `frontend`
3. Update the proxy target in `vite.config.js` to your Render backend URL
4. Deploy — your app goes live at a URL like `https://nyaybot.vercel.app`

---

## 🧪 API Reference

### `POST /api/chat`

Send a conversation to the AI.

**Request Body:**

```json
{
  "messages": [
    { "role": "user", "content": "My landlord won't return my deposit" }
  ]
}
```

**Response:**

```json
{
  "reply": "**Legal Domain:** Tenant Law\n\n**Your Rights:** ..."
}
```

### `GET /api/health`

Health check endpoint.

```json
{ "status": "ok", "message": "NyayBot backend is running" }
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React | 18.3 |
| **Build Tool** | Vite | 5.4 |
| **Backend** | Express.js | 4.19 |
| **AI Engine** | Claude Sonnet 4 (Anthropic SDK) | 0.30 |
| **Runtime** | Node.js (ES Modules) | 18+ |

---

## 💡 Roadmap

> 📄 **[View Full Roadmap →](ROADMAP.md)** — 6 phases, 50+ planned features, timelines & priorities.

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** — MVP | Chat UI, Claude AI, bilingual input, structured responses | ✅ Complete |
| **Phase 2** — Enhanced UX | Dark mode, chat history, PDF export, markdown rendering | 📋 Planned |
| **Phase 3** — Languages | Hindi/Marathi UI, voice input, text-to-speech, accessibility | 📋 Planned |
| **Phase 4** — Intelligence | RAG pipeline, case law citations, legal document templates | 📋 Planned |
| **Phase 5** — Distribution | WhatsApp bot, PWA, nearby legal aid centers, lawyer connect | 💭 Exploring |
| **Phase 6** — Scale | Auth, analytics, rate limiting, API for partners, offline mode | 💭 Exploring |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 🏆 Hackathon Pitch

| | |
|---|---|
| **Problem** | Most Indians can't afford a lawyer and don't know their rights |
| **Solution** | Free, instant AI legal guidance in plain language |
| **Impact** | 1.4 billion people, massive legal literacy gap |
| **Tech** | React + Node.js + Claude AI |
| **Scalability** | Can expand to all 22 official Indian languages |
| **Differentiator** | Structured responses with specific laws, sections & actionable next steps |

---

## ⚠ Disclaimer

> NyayBot provides **general legal information only** and is **not a substitute for professional legal advice**. For serious legal matters, please consult a qualified lawyer. Free legal aid is available at your nearest **District Legal Services Authority (DLSA)**.

---

<div align="center">

Built with ❤ for **Hackathon 2026**

⚖ *Nyay (न्याय) = Justice*

</div>
