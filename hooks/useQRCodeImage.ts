"use client";

import { useEffect, useRef, useState } from "react";
import { getQRStylingOptions } from "@/lib/qr/options";
import type { QRTemplateId } from "@/lib/qr/types";

export interface UseQRCodeImageResult {
  dataUrl: string | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Generates a QR code image (PNG data URL) from data + template using qr-code-styling.
 * Client-only; dynamically imports the library to avoid SSR issues.
 * Reusable for preview, download, or any QR render.
 */
export function useQRCodeImage(
  data: string,
  templateId: QRTemplateId,
  size: number = 256
): UseQRCodeImageResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data.trim()) {
      setDataUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { default: QRCodeStyling } = await import("qr-code-styling");
        if (cancelled) return;

        const options = getQRStylingOptions(data, templateId, size);
        const qr = new QRCodeStyling(options as ConstructorParameters<typeof QRCodeStyling>[0]);

        const container = document.createElement("div");
        container.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
        document.body.appendChild(container);
        containerRef.current = container;
        qr.append(container);

        const raw = await qr.getRawData("png");
        if (cancelled || !raw) return;
        if (!(raw instanceof Blob)) return;

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(raw);
        objectUrlRef.current = url;
        setDataUrl(url);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (containerRef.current?.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
        containerRef.current = null;
      }
    };
  }, [data, templateId, size]);

  return { dataUrl, error, isLoading };
}
