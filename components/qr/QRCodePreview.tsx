"use client";

import { useMemo } from "react";
import { QrCode } from "lucide-react";
import { buildQRData, getCardBaseUrl, type QRTemplateId, type QRContentType } from "@/lib/qr";
import { useQRCodeImage } from "@/hooks/useQRCodeImage";
import { cn } from "@/lib/utils";

export interface QRCodePreviewProps {
  /** QR id — used to build the scan URL encoded in the QR (e.g. /q/{qrId}) */
  qrId: string | null;
  /** Template design (classic, rounded, dots, etc.) */
  templateId: QRTemplateId;
  /** Content type for payload (when not using card URL) */
  contentType?: QRContentType;
  /** Raw content — used when contentType is set and no card URL is used */
  content?: string;
  /** Size in pixels (default 192 for preview) */
  size?: number;
  className?: string;
  /** When true, show a compact placeholder instead of "Your QR will appear here" */
  compact?: boolean;
}

/**
 * Renders a live QR code preview using qr-code-styling.
 * When qrId is set, encodes the scan URL (baseUrl/q/{qrId}). Otherwise uses contentType + content.
 * Modular and reusable for create page, my-qrs list, and download flows.
 */
export function QRCodePreview({
  qrId,
  templateId,
  contentType,
  content = "",
  size = 192,
  className,
  compact = false,
}: QRCodePreviewProps) {
  const data = useMemo(() => {
    if (qrId) {
      return buildQRData("url", "", {
        baseUrl: getCardBaseUrl(),
        qrId,
      });
    }
    if (contentType) {
      return buildQRData(contentType, content);
    }
    return "";
  }, [qrId, contentType, content]);

  const { dataUrl, error, isLoading } = useQRCodeImage(data, templateId, size);

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-4",
          className
        )}
      >
        <QrCode className="size-8 text-destructive" />
        <p className="mt-2 text-center text-xs text-destructive">Failed to generate QR</p>
      </div>
    );
  }

  if (isLoading || !dataUrl) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30",
          compact ? "size-24" : "p-8",
          className
        )}
      >
        <div className="size-8 animate-pulse rounded-md bg-muted" />
        {!compact && (
          <p className="mt-3 text-center text-sm text-muted-foreground">Generating…</p>
        )}
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR code preview"
      width={size}
      height={size}
      className={cn("rounded-lg border border-border bg-white object-contain", className)}
      draggable={false}
    />
  );
}
