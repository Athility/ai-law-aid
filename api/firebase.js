import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Default values for local dev if credentials aren't set up yet
let db = null;

try {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(credPath)) {
    // Only initialize if we have the service account file
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credPath),
      });
    }
    db = admin.firestore();
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not found or invalid. Firestore is disabled.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db, admin };
