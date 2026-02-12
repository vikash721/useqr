/**
 * Client-side QR code download as PNG at a given size.
 * Uses qr-code-styling (dynamic import) and same options as preview.
 * Run only in browser.
 */

import { getQRStylingOptions } from "@/lib/qr/options";
import { getQRStylingOptionsFromStyle } from "@/lib/qr/qr-style";
import type { QRTemplateId } from "@/lib/qr/types";
import type { QRStyle } from "@/lib/qr/qr-style";

export type DownloadQROptions = {
  /** Data string encoded in the QR (e.g. scan URL) */
  data: string;
  /** Template (classic, rounded, etc.) — used when style has no overrides */
  templateId: QRTemplateId;
  /** Full style (colors, logo, shapes). When set, overrides template. */
  style?: QRStyle | null;
  /** Output size in pixels (e.g. 512, 1024, 2048) */
  size: number;
  /** Download filename (e.g. "MyQR-512px.png") */
  filename: string;
};

/**
 * Generates a QR code PNG at the given size and triggers a download.
 * Must be called in the browser. Rejects on error.
 */
export async function downloadQRAsPng(options: DownloadQROptions): Promise<void> {
  const { data, templateId, style, size, filename } = options;
  if (!data?.trim()) {
    throw new Error("QR data is required");
  }

  const { default: QRCodeStyling } = await import("qr-code-styling");
  const styleKey = style && Object.keys(style).length > 0;
  const opts = styleKey
    ? getQRStylingOptionsFromStyle(data, style as QRStyle, size)
    : getQRStylingOptions(data, templateId, size);

  const qr = new QRCodeStyling(opts as ConstructorParameters<typeof QRCodeStyling>[0]);
  const container = document.createElement("div");
  container.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
  document.body.appendChild(container);
  qr.append(container);

  try {
    const raw = await qr.getRawData("png");
    if (!raw || !(raw instanceof Blob)) {
      throw new Error("Failed to generate QR image");
    }
    const url = URL.createObjectURL(raw);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/** Sanitize a string for use in a filename (alphanumeric, hyphen, underscore). */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .trim() || "qr";
}
