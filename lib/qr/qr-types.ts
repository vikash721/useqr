/**
 * QR landing scripts and behavior by content type.
 * Single source of truth for: redirect vs landing, action hrefs (tel:, mailto:, etc.),
 * and extensibility for type-specific landing styles (e.g. vCard layout variants).
 */

import type { QRContentTypeDb } from "@/lib/db/schemas/qr";
import { normalizePhoneDigits } from "@/lib/countries";

/** Behavior when user opens the scan URL */
export type QRScanBehavior = "redirect" | "landing";

/** One tap action (Call, Email, Open WhatsApp, etc.) */
export type QRAction = {
  href: string;
  label: string;
  /** Optional short description or value to show (e.g. phone number) */
  subtitle?: string;
  /** For styling: primary = main CTA, secondary = extra actions */
  variant?: "primary" | "secondary";
};

/** Result of resolving a QR type: either redirect URL or landing config */
export type QRTypeResolution =
  | { behavior: "redirect"; url: string }
  | {
      behavior: "landing";
      /** Main actions (e.g. Call, Email, Send SMS) */
      actions: QRAction[];
      /** Display-only content (text, vCard summary, wifi details, etc.) */
      displayContent?: string;
      /** Optional: for vCard/wifi/event, parsed structure for rich UI later */
      structured?: unknown;
      /** Landing style hint from metadata (e.g. vCard: "minimal" | "card" | "full") */
      landingStyle?: string;
    };

/** User-facing label per type (for headings) */
const TYPE_LABELS: Record<QRContentTypeDb, string> = {
  url: "Link",
  vcard: "Contact",
  wifi: "Wi‑Fi",
  text: "Message",
  email: "Email",
  sms: "SMS",
  phone: "Call",
  location: "Location",
  event: "Event",
  whatsapp: "WhatsApp",
  smart_redirect: "Smart redirect",
};

function trim(content: string): string {
  return content.trim();
}

/**
 * Builds the primary action for phone QR — tap to call.
 * Number is normalized (no leading zeros) for global compatibility.
 */
function resolvePhone(content: string): QRTypeResolution {
  const digits = normalizePhoneDigits(trim(content));
  if (!digits)
    return { behavior: "landing", actions: [], displayContent: "No number set." };
  const href = `tel:${digits}`;
  return {
    behavior: "landing",
    actions: [{ href, label: "Call now", subtitle: digits, variant: "primary" }],
  };
}

/**
 * Builds the primary action for email QR — tap to open mail client.
 */
function resolveEmail(content: string): QRTypeResolution {
  const raw = trim(content);
  if (!raw)
    return { behavior: "landing", actions: [], displayContent: "No email set." };
  const href = `mailto:${raw}`;
  return {
    behavior: "landing",
    actions: [{ href, label: "Send email", subtitle: raw, variant: "primary" }],
  };
}

/**
 * Builds the primary action for SMS — tap to open messages. Message from metadata.message.
 * Number is normalized (no leading zeros) for global compatibility.
 */
function resolveSms(content: string, metadata?: Record<string, unknown>): QRTypeResolution {
  const num = normalizePhoneDigits(trim(content));
  if (!num)
    return { behavior: "landing", actions: [], displayContent: "No number set." };
  const body = (metadata?.message as string)?.trim() ?? "";
  const href = body ? `sms:${num}?body=${encodeURIComponent(body)}` : `sms:${num}`;
  return {
    behavior: "landing",
    actions: [{ href, label: "Send SMS", subtitle: num, variant: "primary" }],
  };
}

/**
 * Builds the primary action for WhatsApp — tap to open chat. Pre-filled text from metadata.message.
 * Number is normalized (no leading zeros) for global compatibility.
 */
function resolveWhatsApp(content: string, metadata?: Record<string, unknown>): QRTypeResolution {
  const num = normalizePhoneDigits(trim(content));
  if (!num)
    return { behavior: "landing", actions: [], displayContent: "No number set." };
  const text = (metadata?.message as string)?.trim() ?? "";
  const href = text
    ? `https://wa.me/${num}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${num}`;
  return {
    behavior: "landing",
    actions: [
      { href, label: "Open in WhatsApp", subtitle: num, variant: "primary" },
    ],
  };
}

/**
 * URL: redirect if valid http(s), otherwise show landing with link or text.
 * Non-http hrefs get https:// so "Open link" works in browser.
 */
function resolveUrl(content: string): QRTypeResolution {
  const raw = trim(content);
  const isHttp = raw.startsWith("http://") || raw.startsWith("https://");
  if (isHttp) return { behavior: "redirect", url: raw };
  const href = raw ? (raw.includes(":") ? raw : `https://${raw}`) : "";
  return {
    behavior: "landing",
    actions: href
      ? [{ href, label: "Open link", subtitle: raw, variant: "primary" }]
      : [],
    displayContent: raw || "No URL set.",
  };
}

/**
 * Text, vCard, wifi, location, event: show landing with display content.
 * vCard supports optional metadata.landingStyle for future layout variants.
 */
function resolveDisplayOnly(
  content: string,
  type: QRContentTypeDb,
  metadata?: Record<string, unknown>
): QRTypeResolution {
  const raw = trim(content) || "No content.";
  const landingStyle = metadata?.landingStyle as string | undefined;
  return {
    behavior: "landing",
    actions: [],
    displayContent: raw,
    landingStyle: landingStyle,
  };
}

/**
 * Resolves how to handle a scan for the given type and content.
 * Use this on the scan page: if behavior is "redirect", redirect; else render landing from resolution.
 */
export function resolveQRScan(
  contentType: QRContentTypeDb,
  content: string,
  metadata?: Record<string, unknown>
): QRTypeResolution {
  const trimmed = trim(content);

  switch (contentType) {
    case "url":
      return resolveUrl(trimmed);
    case "smart_redirect": {
      const redirects = metadata?.smartRedirect as { ios?: string; android?: string; fallback?: string } | undefined;
      const fallback = redirects?.fallback?.trim() || redirects?.ios?.trim() || redirects?.android?.trim() || trimmed || "";
      return { behavior: "redirect", url: fallback || "https://example.com" };
    }
    case "phone":
      return resolvePhone(trimmed);
    case "email":
      return resolveEmail(trimmed);
    case "sms":
      return resolveSms(trimmed, metadata);
    case "whatsapp":
      return resolveWhatsApp(trimmed, metadata);
    case "text":
    case "vcard":
    case "wifi":
    case "location":
    case "event":
      return resolveDisplayOnly(trimmed, contentType, metadata);
    default:
      return resolveDisplayOnly(trimmed, contentType, metadata);
  }
}

/**
 * Returns a user-facing label for the content type (e.g. "Call", "Contact").
 */
export function getQRTypeLabel(type: QRContentTypeDb): string {
  return TYPE_LABELS[type] ?? type;
}

/**
 * Whether this type typically has a single primary action (call, email, etc.).
 */
export function hasPrimaryAction(type: QRContentTypeDb): boolean {
  return ["phone", "email", "sms", "whatsapp"].includes(type);
}
