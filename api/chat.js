export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, analysisMode = "basic", language = "en-US" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://localhost:5000/v1/chat/completions";

    // Call the local Python engine using native fetch to support custom parameters
    const pythonResponse = await fetch(PYTHON_ENGINE_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1024,
        temperature: 0.5,
        analysis_mode: analysisMode,
        language: language
      }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(`Python Engine Error: ${errorText}`);
    }

    const data = await pythonResponse.json();
    let reply = data.choices[0].message.content;
    
    // Clean up any lingering think tags (even if Python engine is instructed not to)
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    res.json({ reply });
  } catch (error) {
    console.error("Local Inference Proxy error:", error);
    res.status(500).json({ error: "Failed to get response from local AI engine" });
  }
}
