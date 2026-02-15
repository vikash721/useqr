/**
 * QR code module — generation, options, payloads, IDs.
 * Use from create page, preview component, and future save/download flows.
 */

export { generateQRId } from "./id";
export type { QRTemplateId } from "./types";
export {
  QR_DEFAULT_BG,
  QR_DEFAULT_FG,
  QR_DEFAULT_MARGIN,
} from "./types";
export { getQRStylingOptions } from "./options";
export type { QRStylingOptions } from "./options";
export { buildQRData, getCardBaseUrl } from "./payload";
export { downloadQRAsPng, sanitizeFilename } from "./download";
export type { DownloadQROptions, DownloadFormat } from "./download";
export type { QRContentType } from "./payload";
export { buildVCard, parseVCard } from "./vcard";
export type { VCardFields } from "./vcard";
export { buildWifiString, parseWifiString } from "./wifi";
export type { WifiFields, WifiSecurity } from "./wifi";
export { buildEventString, parseEventString, buildGoogleCalendarUrl } from "./event";
export type { EventFields } from "./event";
export {
  getQRStylingOptionsFromStyle,
  normalizeQRStyle,
  DEFAULT_QR_STYLE,
} from "./qr-style";
export type { QRStyle, QRLogoOptions, QRDotType, QRCornerSquareType, QRCornerDotType } from "./qr-style";
