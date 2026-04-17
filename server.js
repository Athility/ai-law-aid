import express from 'express';
import cors from 'cors';
import chatHandler from './api/chat.js';

const app = express();
app.use(cors());
app.use(express.json());

// Proxy the Vercel-style handler
app.all('/api/chat', async (req, res) => {
  await chatHandler(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Node Backend (Express) is running on http://localhost:${PORT}`);
  console.log(`Proxying /api/chat to the local Python engine at http://localhost:5000`);
});
