"use client";

import { useEffect, useRef, useState } from "react";
import MetallicPaint from "@/components/MetallicPaint";

/** After this many run cycles the metallic effect is removed and the plain QR is shown */
const METALLIC_CYCLES = 4;

/**
 * Renders a unique ID–based QR code with the same look and theme as the static
 * landing QR (white box, dark modules, metallic effect). Uses qr-code-styling
 * only on the client to avoid SSR issues.
 *
 * On hover / tap the metallic effect fades out and the clean, scannable QR is
 * revealed so phone cameras can decode it.
 */
export default function DynamicLandingQR({
  qrId,
  revealed = false,
}: {
  qrId: string | null;
  /** When true the metallic effect fades out and the clean scannable QR is shown */
  revealed?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [metallicComplete, setMetallicComplete] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const showPlainQR = revealed || metallicComplete;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !qrId) return;

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";
    const data = `${origin}/card/${qrId}`;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled) return;

      const qr = new QRCodeStyling({
        width: 512,
        height: 512,
        data,
        margin: 16,
        type: "canvas",
        qrOptions: { errorCorrectionLevel: "M" },
        backgroundOptions: { color: "#ffffff" },
        dotsOptions: {
          type: "rounded",
          color: "#1e293b",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#1e293b",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#1e293b",
        },
      });

      qr.append(containerRef.current!);

      timer = setTimeout(() => {
        qr.getRawData("png").then((raw) => {
          if (cancelled || !raw) return;
          if (!(raw instanceof Blob)) return;
          const url = URL.createObjectURL(raw);
          objectUrlRef.current = url;
          setQrDataUrl(url);
        });
      }, 150);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [qrId]);

  if (!qrId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
        <div className="h-8 w-8 animate-pulse rounded-none bg-zinc-300" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Hidden container for QR generation */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />

      {qrDataUrl ? (
        <>
          {/* Clean scannable QR — visible when hover/revealed or after metallic cycles complete */}
          <img
            src={qrDataUrl}
            alt="Scannable QR code"
            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
            style={{ opacity: showPlainQR ? 1 : 0 }}
            draggable={false}
          />

          {/* Metallic effect — fades out on hover / tap or when cycles complete */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: showPlainQR ? 0 : 1 }}
            aria-hidden
          >
            <MetallicPaint
              imageSrc={qrDataUrl}
              lightColor="#94a3b8"
              darkColor="#020617"
              brightness={1.55}
              contrast={1.2}
              scale={3.5}
              refraction={0.006}
              blur={0.004}
              liquid={0.28}
              speed={0.15}
              waveAmplitude={0.35}
              chromaticSpread={0.5}
              patternSharpness={1.5}
              tintColor="#ffffff"
              runDuration={3800}
              pauseDuration={50}
              maxCycles={METALLIC_CYCLES}
              onAnimationComplete={() => setMetallicComplete(true)}
            />
          </div>

        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-100">
          <div className="h-8 w-8 animate-pulse rounded-none bg-zinc-300" />
        </div>
      )}
    </div>
  );
}
