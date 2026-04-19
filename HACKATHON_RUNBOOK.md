# 🚀 NyayBot Hackathon Runbook

This guide contains the exact steps to launch your decentralized "Team-Built" AI infrastructure. Because you have opted for local edge-inference, the architecture is split into three separate processes.

## 🏁 Preparation
On presentation day, make sure you open **three (3)** separate terminal windows inside your Virtual Studio Code editor (or standard command prompt). Your working directory should be the root of the project: `\ai-legal-aid`.

---

### Step 0: Initialize the Legal Database (Run Once)
*Before the demo, populate the offline ChromaDB with local acts and laws so the "Deep Analysis" mode can cite sources.*

**Commands:**
```powershell
cd python_engine
.\venv\Scripts\activate
python rag_indexer.py
```
*Wait until it says "Indexing complete."*

---

### Terminal 1: Start the Python AI Engine (The Brain)
*This terminal loads your downloaded local model into memory and exposes the OpenAI-compatible local API.*

**Commands:**
```powershell
cd python_engine
.\venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 5000
```
**Success Check:**
Wait until you see the following lines:
> `Model loaded successfully!`
> `INFO: Uvicorn running on http://0.0.0.0:5000`

---

### Terminal 2: Start the Node.js API Proxy (The Bridge)
*This terminal runs your secure Node server, handling CORS, sessions, and safely forwarding React parameters (like language and analysis_mode) to the Python engine.*

**Commands:**
```powershell
npm run backend
```
*(Note: Do not `cd` anywhere, run this in the root `ai-legal-aid` folder)*

**Success Check:**
Wait until you see:
> `Node Backend (Express) is running on http://localhost:3001`
> `Proxying /api/chat to the local Python engine at http://localhost:5000`

---

### Terminal 3: Start the React Frontend (The UI)
*This terminal runs Vite, handling the beautiful user interface and proxying API calls to Terminal 2.*

**Commands:**
```powershell
npm run dev
```
*(Note: Do not `cd` anywhere, run this in the root `ai-legal-aid` folder)*

**Success Check:**
Wait until you see:
> `➜  Local:   http://localhost:5173/`

---

## 🎉 Ready for Demo
Once all three terminals are glowing with success messages, open your browser and navigate to:
**`http://localhost:5173`**

You can now confidently present your totally offline, free, and compliant local LLM platform! Good luck with the pitch!
