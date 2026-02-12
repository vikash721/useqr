/**
 * Maps our template IDs to qr-code-styling options.
 * Central place to change look (colors, dots, corners) per template.
 */

import type { QRTemplateId } from "./types";
import {
  QR_DEFAULT_BG,
  QR_DEFAULT_FG,
  QR_DEFAULT_MARGIN,
} from "./types";

/** Options shape accepted by qr-code-styling (subset we use) */
export interface QRStylingOptions {
  width: number;
  height: number;
  data: string;
  margin: number;
  type: "canvas" | "svg";
  /** Center logo image URL (when using logo) */
  image?: string;
  shape?: "square" | "circle";
  qrOptions?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H" };
  backgroundOptions?: { color: string };
  dotsOptions?: {
    type?: "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
    color?: string;
  };
  cornersSquareOptions?: {
    type?: "square" | "dot" | "extra-rounded" | "rounded" | "dots" | "classy" | "classy-rounded";
    color?: string;
  };
  cornersDotOptions?: {
    type?: "square" | "dot" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded";
    color?: string;
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
  };
}

const baseOptions: Pick<QRStylingOptions, "margin" | "type" | "qrOptions" | "backgroundOptions"> = {
  margin: QR_DEFAULT_MARGIN,
  type: "canvas",
  qrOptions: { errorCorrectionLevel: "M" },
  backgroundOptions: { color: QR_DEFAULT_BG },
};

/**
 * Returns qr-code-styling options for the given template and data.
 * Reusable for preview, download, and any other QR render.
 */
export function getQRStylingOptions(
  data: string,
  templateId: QRTemplateId,
  size: number = 256
): QRStylingOptions {
  const fg = QR_DEFAULT_FG;
  const dotsAndCorners = (dots: QRStylingOptions["dotsOptions"], cornersSquare: QRStylingOptions["cornersSquareOptions"], cornersDot: QRStylingOptions["cornersDotOptions"]) => ({
    ...baseOptions,
    width: size,
    height: size,
    data,
    dotsOptions: { ...dots, color: fg },
    cornersSquareOptions: { ...cornersSquare, color: fg },
    cornersDotOptions: { ...cornersDot, color: fg },
  });

  switch (templateId) {
    case "classic":
      return dotsAndCorners(
        { type: "square" },
        { type: "square" },
        { type: "square" }
      );
    case "rounded":
      return dotsAndCorners(
        { type: "rounded" },
        { type: "extra-rounded" },
        { type: "dot" }
      );
    case "dots":
      return dotsAndCorners(
        { type: "dots" },
        { type: "extra-rounded" },
        { type: "dot" }
      );
    case "minimal":
      return dotsAndCorners(
        { type: "classy" },
        { type: "square" },
        { type: "square" }
      );
    case "branded":
      return {
        ...dotsAndCorners(
          { type: "rounded" },
          { type: "extra-rounded" },
          { type: "dot" }
        ),
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 4,
        },
      };
    default:
      return dotsAndCorners(
        { type: "square" },
        { type: "square" },
        { type: "square" }
      );
  }
}
