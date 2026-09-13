import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export type Aes256GcmPayload = {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
};

export function getEncryptionKey(): Buffer {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("PII_ENCRYPTION_KEY is not set");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error("PII_ENCRYPTION_KEY must be 32 bytes encoded as base64");
  }

  return key;
}

/** Encrypt UTF-8 PII (CIN, contract payload) with AES-256-GCM. */
export function encryptUtf8(plaintext: string): Aes256GcmPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

/** Decrypt a payload previously produced by `encryptUtf8`. */
export function decryptUtf8(payload: Aes256GcmPayload): string {
  return decryptBuffer(payload).toString("utf8");
}

/** Encrypt an arbitrary binary payload (documents) with AES-256-GCM. */
export function encryptBuffer(plaintext: Buffer): Aes256GcmPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
}

export function decryptBuffer(payload: Aes256GcmPayload): Buffer {
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), payload.iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(payload.authTag);
  return Buffer.concat([decipher.update(payload.ciphertext), decipher.final()]);
}
