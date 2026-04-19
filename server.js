import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';

const app = express();
app.use(cors());
app.use(express.json());

// Proxy the Vercel-style handler for LLM generation
app.all('/api/chat', async (req, res) => {
  await chatHandler(req, res);
});

app.post('/api/jargon', async (req, res) => {
  try {
    const response = await fetch("http://localhost:5000/v1/generate-jargon-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) throw new Error("Python engine failed");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Jargon proxy error:", error);
    res.status(500).json({ error: "Failed to generate jargon report" });
  }
});

import chatsRouter from './api/chats.js';
import shareRouter from './api/share.js';
import foldersRouter from './api/folders.js';

app.use('/api/chats', chatsRouter);
app.use('/api/share', shareRouter);
app.use('/api/folders', foldersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Node Backend (Express) is running on http://localhost:${PORT}`);
  console.log(`Proxying /api/chat to the local Python engine at http://localhost:5000`);
});
