/**
 * QR code module — shared types for generation, templates, and payloads.
 * Keeps template IDs and option shapes in one place for reuse across lib and UI.
 */

/** Template design IDs used in the create flow and QRCodePreview */
export type QRTemplateId =
  | "classic"
  | "rounded"
  | "dots"
  | "minimal"
  | "branded";

/** Default QR module color (foreground) — matches app theme */
export const QR_DEFAULT_FG = "#0f172a";

/** Default QR background */
export const QR_DEFAULT_BG = "#ffffff";

/** Default margin around QR (in pixels) */
export const QR_DEFAULT_MARGIN = 8;
