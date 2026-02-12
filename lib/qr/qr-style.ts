/**
 * Global QR style — controlled, serializable format for storing and rendering
 * user customization (colors, shapes, logo) anywhere in the app.
 */

import type { QRTemplateId } from "./types";
import {
  QR_DEFAULT_BG,
  QR_DEFAULT_FG,
  QR_DEFAULT_MARGIN,
} from "./types";
import { getQRStylingOptions } from "./options";
import type { QRStylingOptions } from "./options";

/** Dot shape for QR modules (matches qr-code-styling) */
export type QRDotType = "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

/** Corner square shape */
export type QRCornerSquareType = "square" | "dot" | "extra-rounded" | "rounded" | "dots" | "classy" | "classy-rounded";

/** Corner dot shape */
export type QRCornerDotType = "square" | "dot" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";

/** Logo in center of QR (URL required; size 0–1, hideBackgroundDots for cleaner scan) */
export type QRLogoOptions = {
  url: string;
  /** Logo size as fraction of QR size (0.2–0.5 recommended). Default 0.4 */
  size?: number;
  /** Hide dots behind logo for cleaner look. Default true when logo present */
  hideBackgroundDots?: boolean;
};

/**
 * Full QR style — stored per QR and used everywhere for rendering.
 * Omit fields to use template defaults; set fields to override.
 */
export type QRStyle = {
  /** Base template preset; when set, its defaults apply before other fields */
  template?: QRTemplateId;
  /** Foreground (dots) color — hex */
  fgColor?: string;
  /** Background color — hex */
  bgColor?: string;
  /** Dot shape for data modules */
  dotType?: QRDotType;
  /** Corner square shape */
  cornerSquareType?: QRCornerSquareType;
  /** Corner dot shape */
  cornerDotType?: QRCornerDotType;
  /** Center logo (URL). Use high error correction (H) when adding logo. */
  logo?: QRLogoOptions;
  /** Margin in pixels */
  margin?: number;
  /** Error correction: H recommended when using logo */
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Overall QR shape (square or circle) */
  shape?: "square" | "circle";
};

/** Default style when nothing is customized */
export const DEFAULT_QR_STYLE: QRStyle = {
  template: "classic",
  fgColor: QR_DEFAULT_FG,
  bgColor: QR_DEFAULT_BG,
  margin: QR_DEFAULT_MARGIN,
  errorCorrectionLevel: "M",
  shape: "square",
};

/**
 * Builds qr-code-styling options from a full QRStyle.
 * Use this whenever we have a stored style (create preview, my-qr, download).
 */
export function getQRStylingOptionsFromStyle(
  data: string,
  style: QRStyle,
  size: number = 256
): QRStylingOptions {
  const templateId = style.template ?? "classic";
  const base = getQRStylingOptions(data, templateId, size);

  const fg = style.fgColor ?? base.dotsOptions?.color ?? QR_DEFAULT_FG;
  const bg = style.bgColor ?? base.backgroundOptions?.color ?? QR_DEFAULT_BG;
  const margin = style.margin ?? base.margin ?? QR_DEFAULT_MARGIN;

  const result: QRStylingOptions = {
    ...base,
    width: size,
    height: size,
    data,
    margin,
    backgroundOptions: { color: bg },
    dotsOptions: {
      type: style.dotType ?? base.dotsOptions?.type ?? "square",
      color: fg,
    },
    cornersSquareOptions: {
      type: style.cornerSquareType ?? base.cornersSquareOptions?.type ?? "square",
      color: fg,
    },
    cornersDotOptions: {
      type: style.cornerDotType ?? base.cornersDotOptions?.type ?? "square",
      color: fg,
    },
    qrOptions: {
      errorCorrectionLevel: style.errorCorrectionLevel ?? base.qrOptions?.errorCorrectionLevel ?? "M",
    },
  };

  if (style.logo?.url?.trim()) {
    const logoSize = Math.min(0.5, Math.max(0.2, style.logo.size ?? 0.4));
    result.imageOptions = {
      hideBackgroundDots: style.logo.hideBackgroundDots ?? true,
      imageSize: logoSize,
      margin: 4,
    };
    result.image = style.logo.url.trim();
    if (!result.qrOptions) result.qrOptions = {};
    result.qrOptions.errorCorrectionLevel = style.errorCorrectionLevel ?? "H";
  }

  if (style.shape === "circle") {
    result.shape = "circle";
  }

  return result;
}

/**
 * Resolves effective style: template-only (legacy) or full style object.
 * Use for rendering: pass either templateId (use getQRStylingOptions) or style (use getQRStylingOptionsFromStyle).
 */
export function normalizeQRStyle(
  templateId: QRTemplateId,
  styleOverrides?: QRStyle | null
): QRStyle {
  if (!styleOverrides || Object.keys(styleOverrides).length === 0) {
    return { template: templateId };
  }
  return {
    template: styleOverrides.template ?? templateId,
    fgColor: styleOverrides.fgColor,
    bgColor: styleOverrides.bgColor,
    dotType: styleOverrides.dotType,
    cornerSquareType: styleOverrides.cornerSquareType,
    cornerDotType: styleOverrides.cornerDotType,
    logo: styleOverrides.logo,
    margin: styleOverrides.margin,
    errorCorrectionLevel: styleOverrides.errorCorrectionLevel,
    shape: styleOverrides.shape,
  };
}
