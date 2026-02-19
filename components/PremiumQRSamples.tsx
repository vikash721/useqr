"use client";

import FlyingPosters from "@/components/FlyingPosters";

const QR_SAMPLE_SRCS = [
  "/qr-code-samples/1.png",
  "/qr-code-samples/2.png",
  "/qr-code-samples/3.png",
  "/qr-code-samples/4.png",
  "/qr-code-samples/5.png",
];

export interface PremiumQRSamplesProps {
  /** Optional section id for anchor links (e.g. "samples") */
  sectionId?: string;
  /** Optional class for the section wrapper */
  className?: string;
}

export function PremiumQRSamples({
  sectionId,
  className = "",
}: PremiumQRSamplesProps) {
  return (
    <section
      id={sectionId}
      className={`relative w-full overflow-hidden border-b border-white/10 bg-black px-6 pb-32 pt-24 lg:pb-40 lg:pt-32 ${className}`}
    >
      {/* Subtle radial gradient for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(52,211,153,0.06)_0%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative z-2 mx-auto max-w-6xl">
        <p className="text-center text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
          Premium samples
        </p>
        <h2 className="mt-4 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Crafted for print and digital
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-500">
          High-resolution, scan-ready. Yours in minutes.
        </p>
        {/* FlyingPosters: scroll / drag to animate — full width for scroll capture */}
        <div className="relative z-2 mt-16 mx-auto h-[65vh] min-h-[420px] w-full">
          <FlyingPosters
            items={QR_SAMPLE_SRCS}
            planeWidth={280}
            planeHeight={400}
            distortion={3}
            scrollEase={0.04}
            cameraFov={45}
            cameraZ={22}
            className="h-full w-full"
          />
        </div>
      </div>
      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-3 h-40 bg-linear-to-t from-black via-black/80 to-transparent lg:h-56"
        aria-hidden
      />
    </section>
  );
}
