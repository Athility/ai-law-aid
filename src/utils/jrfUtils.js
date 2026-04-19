export async function generateJrfFile(folderId, folderName, chats) {
  try {
    // 1. Compile raw text narrative from all chats in the folder.
    let rawTranscripts = `Compilation of all interactions in case: ${folderName}\n\n`;
    chats.forEach(chat => {
      rawTranscripts += `--- Chat: ${chat.title} ---\n`;
      chat.messages.forEach(msg => {
        rawTranscripts += `[${msg.role.toUpperCase()}]: ${msg.content}\n\n`;
      });
      rawTranscripts += `\n`;
    });

    // Guard against exceeding Llama 3 context window (n_ctx=8192)
    // Roughly 4 chars = 1 token. We keep the last ~24000 chars to cover ~6000 tokens,
    // leaving headroom for the system prompt (~500 tokens) and output (~2048 tokens).
    if (rawTranscripts.length > 24000) {
      rawTranscripts = "...[TRUNCATED_EARLIER_CHATS]...\n" + rawTranscripts.slice(-24000);
    }

    // 2. Call the new Proxy endpoint which calls FastAPI
    const response = await fetch("/v1/generate-jargon-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_history: rawTranscripts }),
    });

    if (!response.ok) throw new Error("Failed to generate Jargonized Report");

    const data = await response.json();

    // 3. Construct .jrf JSON Protocol Schema
    const jrfPayload = {
      version: "1.0",
      type: "NyayBot-JRF",
      metadata: {
        folderId,
        folderName,
        exportDate: new Date().toISOString(),
        totalChats: chats.length,
      },
      rawTranscripts: rawTranscripts,
      legalBrief: data.report
    };

    // 4. Trigger download
    const blob = new Blob([JSON.stringify(jrfPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName.replace(/\s+/g, '_')}_Dossier.jrf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;

  } catch (error) {
    console.error("JRF Generation error:", error);
    return false;
  }
}

export function parseJrfFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.type !== "NyayBot-JRF") {
          reject(new Error("Invalid file protocol. Expected NyayBot-JRF."));
        } else {
          resolve(json);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading failed."));
    reader.readAsText(file);
  });
}
