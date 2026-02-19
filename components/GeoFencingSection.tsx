"use client";

import { MapPin, ShieldCheck, Ban, Navigation } from "lucide-react";

/**
 * GeoFencingSection – Landing-page feature highlight for Geo-Fenced QR Codes.
 * Pure presentational component. Uses semantic HTML for SEO.
 */
export function GeoFencingSection() {
  return (
    <section
      id="geo-fencing"
      aria-labelledby="geo-fencing-heading"
      className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Two-column: illustration left, copy right */}
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* ── Map illustration ─────────────────────────────── */}
          <div className="relative flex w-full max-w-md shrink-0 items-center justify-center lg:w-1/2">
            <GeoFenceIllustration />
          </div>

          {/* ── Copy ─────────────────────────────────────────── */}
          <div className="w-full text-center lg:w-1/2 lg:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
              Advanced Feature
            </p>
            <h2
              id="geo-fencing-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
            >
              Geo Fenced{" "}
              <span className="text-emerald-400">QR Codes</span>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              Creates a virtual boundary so your QR{" "}
              <strong className="font-semibold text-white">
                works only within the defined physical area.
              </strong>
            </p>

            <ul className="mt-8 space-y-4 text-left">
              <BenefitItem
                icon={<MapPin className="size-5 text-emerald-400" strokeWidth={1.5} />}
                text="Restrict QR access to specific locations"
              />
              <BenefitItem
                icon={<ShieldCheck className="size-5 text-emerald-400" strokeWidth={1.5} />}
                text="Prevent unauthorized scanning outside your area"
              />
              <BenefitItem
                icon={<Navigation className="size-5 text-emerald-400" strokeWidth={1.5} />}
                text="Ideal for events, campuses, and secure zones"
              />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Subcomponents ──────────────────────────────────────────────────────── */

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-sm text-zinc-300 sm:text-base">{text}</span>
    </li>
  );
}

/**
 * Inline SVG illustration: abstract map silhouette with geo-fence ring,
 * inside pin, and rejected markers outside the fence.
 */
function GeoFenceIllustration() {
  return (
    <div className="relative aspect-square w-full max-w-[380px]">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="Map showing a geo-fenced area with a QR-code location pin inside and blocked markers outside"
      >
        {/* ── Subtle grid background ────────────────────────── */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
          {/* Radial glow behind the fence */}
          <radialGradient id="fenceGlow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />
        <circle cx="200" cy="200" r="160" fill="url(#fenceGlow)" />

        {/* ── Abstract country / land mass silhouette ────── */}
        <path
          d="M100,120 Q130,80 180,90 Q220,70 260,100 Q310,90 330,130
             Q350,170 340,210 Q350,260 320,290 Q290,330 240,320
             Q200,340 160,310 Q120,290 100,250 Q80,210 90,170
             Q85,140 100,120Z"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* ── Inner region / province ────────────────────── */}
        <path
          d="M160,150 Q190,130 220,140 Q260,135 270,160
             Q285,190 275,220 Q270,250 240,260
             Q210,275 180,255 Q150,240 145,210
             Q140,180 160,150Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* ── Geo-fence circle (dashed emerald ring) ────── */}
        <circle
          cx="210"
          cy="200"
          r="85"
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          strokeDasharray="8 6"
          opacity="0.7"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="28" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Solid subtle fill inside the fence */}
        <circle cx="210" cy="200" r="85" fill="#34d399" opacity="0.06" />

        {/* ── Location pin INSIDE the fence ──────────────── */}
        <g transform="translate(210,185)">
          {/* Drop shadow */}
          <ellipse cx="0" cy="28" rx="12" ry="4" fill="rgba(0,0,0,0.3)" />
          {/* Pin body */}
          <path
            d="M0,-22 C-13,-22 -22,-13 -22,0 C-22,12 0,30 0,30 C0,30 22,12 22,0 C22,-13 13,-22 0,-22Z"
            fill="#34d399"
          />
          {/* Inner dot */}
          <circle cx="0" cy="-2" r="8" fill="#064e3b" />
          <circle cx="0" cy="-2" r="5" fill="#34d399" opacity="0.6" />
        </g>

        {/* ── Pulse ring around pin ──────────────────────── */}
        <circle cx="210" cy="183" r="18" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="r" from="18" to="36" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* ── Denied marker 1 – top-left of map ─────────── */}
        <g transform="translate(120,110)">
          <circle cx="0" cy="0" r="12" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
          <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* ── Denied marker 2 – bottom-right ────────────── */}
        <g transform="translate(320,280)">
          <circle cx="0" cy="0" r="12" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
          <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* ── Denied marker 3 – right side ──────────────── */}
        <g transform="translate(330,150)">
          <circle cx="0" cy="0" r="10" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
          <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* ── Small dots representing "scans" inside fence ── */}
        <circle cx="190" cy="215" r="3" fill="#34d399" opacity="0.5" />
        <circle cx="230" cy="175" r="2.5" fill="#34d399" opacity="0.4" />
        <circle cx="220" cy="225" r="2" fill="#34d399" opacity="0.35" />
      </svg>
    </div>
  );
}

export default GeoFencingSection;
