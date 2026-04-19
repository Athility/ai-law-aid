import { db } from "../api/firebase.js";

async function checkDatabase() {
  console.log("🔍 Starting Database Health Check...");
  
  if (!db) {
    console.error("❌ CRITICAL: Firestore 'db' object is null.");
    console.log("\nPossible Causes:");
    console.log("1. .env file is missing 'GOOGLE_APPLICATION_CREDENTIALS'");
    console.log("2. The service-account.json file path is incorrect.");
    console.log("3. The service-account.json file is missing or corrupted.");
    process.exit(1);
  }

  try {
    console.log("⏳ Attempting to contact Firebase Firestore...");
    // Try to list collections as a basic read test
    const collections = await db.listCollections();
    console.log("✅ SUCCESS: Database is online and accessible.");
    console.log(`📡 Found ${collections.length} active collection(s).`);
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR: Could not talk to Firestore.");
    console.error("Details:", error.message);
    console.log("\nPossible Causes:");
    console.log("1. No internet connection.");
    console.log("2. Firebase Project ID mismatch.");
    console.log("3. Service account lacks proper permissions (Editor or Owner needed).");
    process.exit(1);
  }
}

checkDatabase();
