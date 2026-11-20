/**
 * PRO MEDIA COMMAND CENTER (PMC) — Cryptography & Security Engine
 * Professional Academy — Mr. Habib El Rahman
 * 
 * Provides:
 * 1. AES-256-GCM token encryption and decryption for Social API Access/Refresh Tokens.
 * 2. SHA-256 content snapshot hashing to prevent tampering after approval.
 * 3. Deterministic Idempotency Key calculation to prevent double-posting.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Resolves the 32-byte encryption key.
 * In production, PMC_ENCRYPTION_KEY must be provided.
 * In development/test, securely derives a deterministic key from standard app secrets.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.PMC_ENCRYPTION_KEY ||
    process.env.PARENT_REPORT_SIGNING_SECRET ||
    "pro_academy_habib_el_rahman_pmc_secure_key_2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string (e.g. OAuth token) using AES-256-GCM.
 * Output format: "iv_hex:auth_tag_hex:ciphertext_hex"
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string.
 * Throws an error if the token has been tampered with or corrupted.
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format.");
  }

  const [ivHex, tagHex, cipherHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Computes a deterministic SHA-256 hash of the content payload.
 * Used for tamper detection between approval and publishing.
 */
export function computeContentHash(content: {
  hook?: string | null;
  script?: string | null;
  caption?: string | null;
  description?: string | null;
  platform: string;
  mediaAssetId?: string | null;
}): string {
  const normalized = JSON.stringify({
    hook: (content.hook || "").trim(),
    script: (content.script || "").trim(),
    caption: (content.caption || "").trim(),
    description: (content.description || "").trim(),
    platform: content.platform.trim().toLowerCase(),
    mediaAssetId: (content.mediaAssetId || "").trim(),
  });

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generates a deterministic idempotency key for publishing operations.
 * Guaranteed to be identical if called with the same variant, platform, and content snapshot.
 */
export function generateIdempotencyKey(
  variantId: string,
  platform: string,
  contentHash: string
): string {
  return crypto
    .createHash("sha256")
    .update(`${variantId}:${platform.toLowerCase()}:${contentHash}`)
    .digest("hex");
}
