/**
 * QR code ID generation — stable, URL-safe random IDs for preview and persisted QRs.
 * Uses crypto for randomness; safe for browser and Node.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DEFAULT_LENGTH = 12;

/**
 * Generates a random QR id suitable for URLs and storage.
 * Not cryptographically unique; use for previews and short-lived IDs.
 * For persisted QRs you may want UUID or nanoid from DB.
 */
export function generateQRId(length: number = DEFAULT_LENGTH): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  }
  // Fallback for very old envs (not used in modern Next/browser)
  let id = "";
  for (let i = 0; i < length; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}
