// Base64 generic converters
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a strong AES-GCM key from the user's Google ID (sub)
async function deriveKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Use a hardcoded salt so the key is deterministic for the exact same 'sub'
  const salt = enc.encode("NyayBotSalt-2026");

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt an object to an encrypted string + IV
export async function encryptData(dataObject, userSub) {
  try {
    const key = await deriveKey(userSub);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      enc.encode(JSON.stringify(dataObject))
    );

    return {
      encryptedData: bufferToBase64(ciphertext),
      iv: bufferToBase64(iv.buffer),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

// Decrypt back to an object
export async function decryptData(encryptedDataB64, ivB64, userSub) {
  try {
    const key = await deriveKey(userSub);
    const iv = new Uint8Array(base64ToBuffer(ivB64));
    const ciphertext = base64ToBuffer(encryptedDataB64);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
}
