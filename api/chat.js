import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const SYSTEM_PROMPT = `You are NyayBot, an AI Legal Aid Assistant specializing in Indian law. You help everyday Indian citizens (including those with no legal background) understand their legal situation clearly and simply.

When a user describes their problem, always structure your response like this:

**Legal Domain:** [e.g., Tenant Law / Consumer Protection / Labour Law / Family Law / Cyber Crime / Criminal Law]

**Your Rights:**
Explain their rights in 2-3 sentences using simple, plain language. No heavy legal jargon.

**Relevant Indian Laws:**
List 2-3 specific laws, acts, or sections that apply. Examples:
- Consumer Protection Act, 2019 — Section 35 (Filing a consumer complaint)
- Transfer of Property Act, 1882 — Section 106 (Tenancy termination)
- IPC Section 420 (Cheating and dishonestly inducing delivery of property)
- Protection of Women from Domestic Violence Act, 2005
- RERA Act, 2016 — Section 18 (Builder delay compensation)
- Payment of Wages Act, 1936

**What You Should Do:**
Give 3 clear, actionable next steps numbered 1, 2, 3. Be specific — mention where to go, what to file, or who to contact.

**Where to Approach:**
Mention the right forum or authority (e.g., Consumer Forum / District Court / Cyber Cell / Labour Court / RERA / Police Station / Legal Services Authority)

---
*Disclaimer: This is general legal information, not legal advice. For serious matters, please consult a qualified lawyer. Free legal aid is available at your nearest District Legal Services Authority (DLSA).*

---

Keep responses clear and empathetic. The user may be stressed. Support Hindi queries equally well. **Do not include any internal thoughts, reasoning, or "thinking" steps in your output. Go straight to the structured response.** Always end by asking: "Do you want me to explain any of this further, or do you have a follow-up question?"`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const response = await client.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.5,
      top_p: 1,
    });

    let reply = response.choices[0].message.content;
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    res.json({ reply });
  } catch (error) {
    console.error("NVIDIA API error:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// For local testing
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ NyayBot backend running locally on http://localhost:${PORT}`);
  });
}

export default app;
