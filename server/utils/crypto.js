// server/utils/crypto.js
import crypto from "crypto";

/**
 * AES-256-CBC encryption/decryption helpers.
 * ENCRYPTION_KEY in .env must be a 32-byte hex string (64 hex chars).
 */

const ALGORITHM = "aes-256-cbc";
const IV_LEN = 16;

export function encryptText(plain) {
  if (plain == null) return null;
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (hex)");
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(String(plain), "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

export function decryptText(ciphertext) {
  if (!ciphertext) return null;
  try {
    const [ivB64, encrypted] = ciphertext.split(":");
    if (!ivB64 || !encrypted) return null;
    const iv = Buffer.from(ivB64, "base64");
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let dec = decipher.update(encrypted, "base64", "utf8");
    dec += decipher.final("utf8");
    return dec;
  } catch (err) {
    console.error("decryptText error:", err);
    return null;
  }
}
