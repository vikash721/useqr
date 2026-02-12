/**
 * Builds the raw string to encode in a QR code (URL, text, etc.) from type + content.
 * Used for preview and for final save; single source of truth for encoding logic.
 */

/** QR content type IDs — must match create page QR_TYPES */
export type QRContentType =
  | "url"
  | "vcard"
  | "wifi"
  | "text"
  | "email"
  | "sms"
  | "phone"
  | "location"
  | "event"
  | "whatsapp";

/**
 * Builds the data string to encode in the QR for the given type and content.
 * For scan redirect flows (preview or saved), pass baseUrl and qrId to get baseUrl/q/{qrId}.
 * /card/{id} is reserved for a different purpose (e.g. shareable card view).
 */
export function buildQRData(
  type: QRContentType,
  content: string,
  options?: {
    /** When set, returns the scan URL (baseUrl/q/{qrId}) encoded in the QR */
    baseUrl?: string;
    qrId?: string;
  }
): string {
  const { baseUrl, qrId } = options ?? {};

  if (baseUrl && qrId) {
    return `${baseUrl.replace(/\/$/, "")}/q/${qrId}`;
  }

  switch (type) {
    case "url":
      return content.trim() || "https://example.com";
    case "text":
      return content.trim() || " ";
    case "phone":
      return content.trim() ? `tel:${content.trim()}` : "tel:";
    case "sms": {
      const trimmed = content.trim();
      if (!trimmed) return "sms:";
      const [num, ...rest] = trimmed.split(/[,\s]/);
      const body = rest.join(" ").trim();
      return body ? `sms:${num}?body=${encodeURIComponent(body)}` : `sms:${num}`;
    }
    case "email":
      return content.trim() ? `mailto:${content.trim()}` : "mailto:";
    case "whatsapp":
      return content.trim() ? `https://wa.me/${content.trim().replace(/\D/g, "")}` : "https://wa.me/";
    case "location":
      return content.trim() || "geo:0,0";
    case "vcard":
    case "wifi":
    case "event":
      return content.trim() || " ";
    default:
      return content.trim() || " ";
  }
}

/**
 * Base URL for scan links (preview and saved). Prefers window.origin on client.
 */
export function getCardBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";
}
