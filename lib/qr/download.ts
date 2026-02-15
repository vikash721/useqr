/**
 * Client-side QR code download utilities.
 * Uses qr-code-styling (dynamic import) and same options as preview.
 * Run only in browser.
 */

import { getQRStylingOptions } from "@/lib/qr/options";
import { getQRStylingOptionsFromStyle } from "@/lib/qr/qr-style";
import type { QRTemplateId } from "@/lib/qr/types";
import type { QRStyle } from "@/lib/qr/qr-style";

export type DownloadFormat = "png" | "svg" | "jpeg" | "webp";

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
  /** Output format — defaults to "png" */
  format?: DownloadFormat;
  /** If true, render with transparent background (PNG, SVG, WebP only) */
  transparent?: boolean;
};

/**
 * Shared helper: creates a qr-code-styling instance, renders it, and returns raw data.
 */
async function generateQRBlob(
  data: string,
  templateId: QRTemplateId,
  style: QRStyle | null | undefined,
  size: number,
  format: DownloadFormat,
  transparent = false
): Promise<Blob> {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const styleKey = style && Object.keys(style).length > 0;

  // SVG needs type: "svg" in options for proper output
  const baseOpts = styleKey
    ? getQRStylingOptionsFromStyle(data, style as QRStyle, size)
    : getQRStylingOptions(data, templateId, size);

  let opts = format === "svg" ? { ...baseOpts, type: "svg" as const } : baseOpts;

  // Apply transparent background
  if (transparent) {
    opts = {
      ...opts,
      backgroundOptions: { color: "transparent" },
    };
  }

  const qr = new QRCodeStyling(opts as ConstructorParameters<typeof QRCodeStyling>[0]);
  const container = document.createElement("div");
  container.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
  document.body.appendChild(container);
  qr.append(container);

  try {
    const raw = await qr.getRawData(format);
    if (!raw || !(raw instanceof Blob)) {
      throw new Error(`Failed to generate QR as ${format.toUpperCase()}`);
    }
    return raw;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/** Trigger a browser download from a Blob + filename. */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a QR code at the given size/format and triggers a download.
 * Must be called in the browser. Rejects on error.
 */
export async function downloadQRAsPng(options: DownloadQROptions): Promise<void> {
  const { data, templateId, style, size, filename, format = "png", transparent = false } = options;
  if (!data?.trim()) {
    throw new Error("QR data is required");
  }
  const blob = await generateQRBlob(data, templateId, style, size, format, transparent);
  triggerDownload(blob, filename);
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
