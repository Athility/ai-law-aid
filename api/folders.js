import express from "express";
import { db } from "./firebase.js";
import { verifyGoogleToken } from "./middleware/auth.js";

const router = express.Router();

router.use(verifyGoogleToken);

router.get("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore configuration missing" });

    const userId = req.user.sub;
    const foldersRef = db.collection("users").doc(userId).collection("folders");
    const snapshot = await foldersRef.get();

    if (snapshot.empty) return res.json([]);

    const folders = [];
    snapshot.forEach(doc => folders.push(doc.data()));
    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore configuration missing" });

    const userId = req.user.sub;
    const { id, name, createdAt, updatedAt } = req.body;

    if (!id || !name) return res.status(400).json({ error: "Missing required fields" });

    const folderRef = db.collection("users").doc(userId).collection("folders").doc(id);
    await folderRef.set({ id, name, createdAt, updatedAt });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving folder:", error);
    res.status(500).json({ error: "Failed to save folder" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore configuration missing" });
    const userId = req.user.sub;
    const folderId = req.params.id;

    await db.collection("users").doc(userId).collection("folders").doc(folderId).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
});

// === DELETE: Clear all folders for user ===
router.delete("/", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Firestore configuration missing" });

    const userId = req.user.sub;
    const foldersRef = db.collection("users").doc(userId).collection("folders");
    const snapshot = await foldersRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, message: "No folders to delete." });
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ success: true, message: "All folders deleted." });
  } catch (error) {
    console.error("Error clearing folders:", error);
    res.status(500).json({ error: "Failed to clear folders" });
  }
});

export default router;
