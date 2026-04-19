import express from "express";
import { db } from "./firebase.js";
import { verifyGoogleToken } from "./middleware/auth.js";

const router = express.Router();

/**
 * POST /api/share
 * Creates a shared chat record.
 * Body: { chatId, title, messages, allowedEmails[] }
 * Requires: Bearer token (owner must be authenticated)
 */
router.post("/", verifyGoogleToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore is not configured." });

    const { chatId, title, messages, allowedEmails } = req.body;

    if (!chatId || !messages || !Array.isArray(allowedEmails)) {
      return res.status(400).json({ error: "Missing required fields: chatId, messages, allowedEmails." });
    }

    // Normalize allowed emails to lowercase
    const normalizedEmails = allowedEmails.map(e => e.trim().toLowerCase());

    // Always include the owner's own email
    const ownerEmail = req.user.email?.toLowerCase();
    if (ownerEmail && !normalizedEmails.includes(ownerEmail)) {
      normalizedEmails.push(ownerEmail);
    }

    const shareId = `${chatId}-${Date.now().toString(36)}`;
    const shareRef = db.collection("shared_chats").doc(shareId);

    await shareRef.set({
      shareId,
      chatId,
      title: title || "Shared Legal Chat",
      messages,
      ownerEmail,
      ownerName: req.user.name || "Anonymous",
      allowedEmails: normalizedEmails,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, shareId });
  } catch (error) {
    console.error("Error creating share:", error);
    res.status(500).json({ error: "Failed to create share link." });
  }
});

/**
 * GET /api/share/:shareId
 * Fetches a shared chat if the requesting user is in the allowedEmails list.
 * Requires: Bearer token
 */
router.get("/:shareId", verifyGoogleToken, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore is not configured." });

    const { shareId } = req.params;
    const requesterEmail = req.user.email?.toLowerCase();

    const shareRef = db.collection("shared_chats").doc(shareId);
    const doc = await shareRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Shared chat not found." });
    }

    const shareData = doc.data();

    if (!shareData.allowedEmails.includes(requesterEmail)) {
      return res.status(403).json({ error: "Access denied. Your email is not on the allowed list for this shared chat." });
    }

    res.json({
      shareId: shareData.shareId,
      title: shareData.title,
      messages: shareData.messages,
      ownerName: shareData.ownerName,
      createdAt: shareData.createdAt,
    });
  } catch (error) {
    console.error("Error fetching share:", error);
    res.status(500).json({ error: "Failed to fetch shared chat." });
  }
});

export default router;
