import express from "express";
import { db } from "./firebase.js";
import { verifyGoogleToken } from "./middleware/auth.js";

const router = express.Router();

// All routes here are protected
router.use(verifyGoogleToken);

// === GET: Fetch all encrypted user chats ===
router.get("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore is not configured." });

    const userId = req.user.sub;
    const chatsRef = db.collection("users").doc(userId).collection("chats");
    const snapshot = await chatsRef.get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const chats = [];
    snapshot.forEach((doc) => {
      chats.push(doc.data());
    });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// === POST: Save an encrypted chat ===
router.post("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore is not configured." });

    const userId = req.user.sub;
    const { id, title, encryptedData, iv, updatedAt } = req.body;

    if (!id || !encryptedData || !iv) {
      return res.status(400).json({ error: "Missing required chat payload fields." });
    }

    const chatDocRef = db.collection("users").doc(userId).collection("chats").doc(id);

    const chatPayload = {
      id,
      title,
      encryptedData,
      iv,
      updatedAt: updatedAt || new Date().toISOString(),
    };

    await chatDocRef.set(chatPayload);

    res.json({ success: true, message: "Chat saved securely." });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// === DELETE: Remove a chat ===
router.delete("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore is not configured." });

    const userId = req.user.sub;
    const chatId = req.params.id;

    const chatDocRef = db.collection("users").doc(userId).collection("chats").doc(chatId);
    await chatDocRef.delete();

    res.json({ success: true, message: "Chat deleted." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

export default router;
