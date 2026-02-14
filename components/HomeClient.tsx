"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Image, Link2, Package, RefreshCw, UserCircle, UtensilsCrossed, ShoppingBag, Building2, Ticket, Stethoscope, BookOpen } from "lucide-react";
import Link from "next/link";
import DynamicLandingQR from "@/components/DynamicLandingQR";
import PixelBlast from "@/components/PixelBlast";
import PixelCard from "@/components/PixelCard";
import LetterGlitch from "@/components/LetterGlitch";
import { FAQSection } from "@/components/FAQSection";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { LandingFooter } from "@/components/LandingFooter";
import { PremiumQRSamples } from "@/components/PremiumQRSamples";
import { LandingHeader } from "@/components/LandingHeader";
import { MissionPassedModal } from "@/components/modals";
import ScrollFloat from "@/components/ScrollFloat";
import { UseCaseCard } from "@/components/UseCaseCard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { scanApi } from "@/lib/api";
import { showDevelopmentNotice } from "@/lib/toast";
import { useScanStore } from "@/stores/useScanStore";
import { useShouldShowHeader } from "@/utils/sidebar";

function HeroBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        className="h-full w-full opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52, 211, 153, 0.08) 0%, transparent 70%)",
        }}
      />
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden opacity-90"
      style={{
        maskImage:
          "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 38%, rgba(0,0,0,0.4) 55%, black 72%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 38%, rgba(0,0,0,0.4) 55%, black 72%)",
        maskSize: "100% 100%",
        maskPosition: "center",
        WebkitMaskSize: "100% 100%",
        WebkitMaskPosition: "center",
      }}
    >
      <PixelBlast
        variant="square"
        pixelSize={6}
        color="#34d399"
        transparent
        edgeFade={0.12}
        patternScale={2}
        patternDensity={0.5}
        pixelSizeJitter={0.05}
        enableRipples={false}
        speed={0.25}
        antialias={false}
        maxPixelRatio={1}
        targetFps={20}
        autoPauseOffscreen
        className="h-full w-full"
      />
    </div>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const showHeader = useShouldShowHeader();
  const qrId = useScanStore((s) => s.qrId);
  const scanStatus = useScanStore((s) => s.scanStatus);
  const initQrId = useScanStore((s) => s.initQrId);
  const setScanStatus = useScanStore((s) => s.setScanStatus);
  const reset = useScanStore((s) => s.reset);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sseReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const sseRetryCountRef = useRef(0);
  const [cardHovered, setCardHovered] = useState(false);
  const [sseReconnectKey, setSseReconnectKey] = useState(0);
  const [scanWaitingPaused, setScanWaitingPaused] = useState(false);

  /** Stop SSE + polling after this long; user can tap overlay to resume listening. */
  const SCAN_WAIT_MAX_MS = 7 * 60 * 1000;
  // const SCAN_WAIT_MAX_MS = 10 * 1000;

  // Signed in on landing — redirect to dashboard (backup if middleware didn't run)
  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  // Init stable qrId when landing is shown
  useEffect(() => {
    if (!showHeader) initQrId();
  }, [showHeader, initQrId]);

  // ---------------------------------------------------------------------------
  // Pause SSE + polling after 7 min to avoid infinite requests; user taps QR to resume.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (showHeader || !qrId || scanStatus?.scanned || scanWaitingPaused) return;
    const t = setTimeout(() => setScanWaitingPaused(true), SCAN_WAIT_MAX_MS);
    return () => clearTimeout(t);
  }, [showHeader, qrId, scanStatus?.scanned, scanWaitingPaused, SCAN_WAIT_MAX_MS]);

  // ---------------------------------------------------------------------------
  // Polling safety-net: always runs alongside SSE (unless paused after 7 min).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (showHeader || !qrId || scanStatus?.scanned || scanWaitingPaused) return;

    const poll = async () => {
      try {
        const data = await scanApi.getStatus(qrId);
        if (data.scanned) setScanStatus(data);
      } catch {
        /* polling — silently ignore failures */
      }
    };

    // Immediate first check (page load / reset)
    poll();
    const interval = setInterval(poll, 5000);

    // Poll immediately when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Poll immediately when network comes back online
    const onOnline = () => poll();
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [showHeader, qrId, scanStatus?.scanned, setScanStatus, scanWaitingPaused]);

  // ---------------------------------------------------------------------------
  // SSE: fast path — instant delivery via server push (unless paused after 7 min).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (showHeader || !qrId || scanStatus?.scanned || scanWaitingPaused) return;
    if (sseRetryCountRef.current > 5) return;
    // Close any existing connection before opening a new one (e.g. after "Scan again")
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    const url = `/api/scan/status/stream?qrId=${encodeURIComponent(qrId)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { scanned: boolean; scannedAt?: number };
        setScanStatus(data);
        es.close();
        eventSourceRef.current = null;
      } catch (_) {}
    };
    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      sseRetryCountRef.current += 1;
      if (sseRetryCountRef.current <= 5) {
        const delay = Math.min(1500 * 2 ** (sseRetryCountRef.current - 1), 12000);
        sseReconnectTimeoutRef.current = setTimeout(
          () => setSseReconnectKey((k) => k + 1),
          delay
        );
      }
    };
    return () => {
      es.close();
      eventSourceRef.current = null;
      if (sseReconnectTimeoutRef.current) {
        clearTimeout(sseReconnectTimeoutRef.current);
        sseReconnectTimeoutRef.current = null;
      }
    };
  }, [showHeader, qrId, scanStatus?.scanned, setScanStatus, sseReconnectKey, scanWaitingPaused]);

  // Development notice on landing — show on every refresh/visit (delay so Toaster is mounted). Skip when view=am.
  useEffect(() => {
    if (!showHeader && searchParams.get("view") !== "am") {
      const timer = setTimeout(() => {
        showDevelopmentNotice();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showHeader, searchParams]);

  const missionPassedOpen = Boolean(scanStatus?.scanned);

  return (
    <>
      <MissionPassedModal
        open={missionPassedOpen}
        onOpenChange={(open) => {
          if (!open) {
            reset();
            initQrId();
            setSseReconnectKey(0);
            sseRetryCountRef.current = 0;
            setScanWaitingPaused(false);
          }
        }}
      />
      {!showHeader && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What can I put in a QR code?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Almost anything: URLs, web pages, images, videos, PDFs, plain text, or your contact info. UseQR lets you pack links, media, or a full digital identity into one reusable code.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I change the content later?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Your QR code stays the same—only the content behind it updates. Change the link, swap the file, or edit your contact details anytime. No need to reprint or create a new code.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is there a limit on scans?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. Once your QR is live, it can be scanned as many times as needed. We don't cap scans, so you can use the same code for events, print, or long-term use.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do get found / contact QRs work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Create a QR that points to your contact details or a simple page. Stick it on keys, bags, or gear. Anyone who finds the item can scan and reach you.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do I need an account to create a QR?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can create and download a QR without signing up. For reusable codes you can update later, saving designs, and managing multiple QRs, an account is required.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Are QR codes safe to scan?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, QR codes themselves are safe. They're just a way to encode information. However, always check the URL preview before visiting a link. UseQR codes are secure and you control where they point.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do QR codes expire?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Static QR codes never expire. Dynamic QR codes from UseQR remain active as long as your account is active. Your codes won't suddenly stop working.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What's the difference between static and dynamic QR codes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Static QR codes have fixed content that can't be changed. Dynamic QR codes let you update the destination URL or content anytime without creating a new code. Dynamic codes also provide scan analytics.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I track how many people scan my QR code?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, with dynamic QR codes. You get detailed analytics including total scans, unique users, locations, devices, and scan times. This helps you measure campaign performance.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do QR codes work without internet?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Scanning a QR code requires a camera, but accessing the content usually needs internet. However, QR codes with plain text, WiFi passwords, or vCards can work offline since the data is embedded in the code.",
                  },
                },
              ],
            }),
          }}
        />
      )}
      {showHeader ? (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
      ) : (
        <LandingHeader />
      )}
      <main className="relative flex-1">
        {!showHeader ? (
          <div className="relative">
            {/* Hero only — pixel background contained here */}
            <section className="relative flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center overflow-hidden px-6 py-24 sm:py-32">
              <div className="absolute inset-0 z-0 will-change-auto">
                <HeroBackground />
              </div>
              <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
              <div className="flex max-w-xl flex-col items-center gap-8 text-center lg:items-start lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                  Dynamic QR Code Generator.{" "}
                  <span className="text-emerald-400">Simple & Powerful.</span>
                </h1>
                <p className="text-lg text-zinc-400 sm:text-xl">
                  Create custom QR codes for links, contacts, menus, events, or anything else. Track scans and update content anytime.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-none bg-emerald-500 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex h-10 items-center justify-center rounded-none border border-white/20 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
              <div
                className="relative flex shrink-0 flex-col items-center"
                onMouseEnter={() => setCardHovered(true)}
                onMouseLeave={() => setCardHovered(false)}
                onTouchStart={() => setCardHovered(true)}
                onTouchEnd={() => setCardHovered(false)}
              >
                <div className="relative">
                  {scanWaitingPaused && (
                    <button
                      type="button"
                      onClick={() => {
                        setScanWaitingPaused(false);
                        setSseReconnectKey(0);
                        sseRetryCountRef.current = 0;
                      }}
                      className="absolute inset-0 cursor-pointer z-20 flex flex-col items-center justify-center gap-2 rounded-none bg-zinc-900/95 backdrop-blur-sm transition-opacity hover:opacity-95"
                      aria-label="Resume waiting for scan"
                    >
                      <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                        Paused
                      </span>
                      <span className="text-xs text-zinc-500">
                        Tap to scan now
                      </span>
                    </button>
                  )}
                  <PixelCard
                    variant="default"
                    colors="#94a3b8,#64748b,#475569"
                    gap={6}
                    speed={30}
                    className="h-[340px] w-[280px] rounded-none border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/30 lg:h-[380px] lg:w-[300px]"
                  >
                  {/* Visiting card: QR on top (no inner padding), info at bottom */}
                  <div className="absolute inset-0 flex flex-col p-0">
                    {/* QR — LetterGlitch bg, QR on top */}
                    <div className="relative flex shrink-0 w-full min-h-[52%] overflow-hidden">
                      <div className="absolute inset-0">
                        <LetterGlitch
                          glitchColors={["#1e293b", "#34d399", "#10b981"]}
                          glitchSpeed={80}
                          centerVignette={false}
                          outerVignette={true}
                          smooth={true}
                          characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"
                        />
                      </div>
                      <div className="relative z-10 flex flex-1 items-center justify-center p-4">
                        <div className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:h-[160px] lg:w-[160px]">
                          <DynamicLandingQR qrId={qrId} revealed={cardHovered} />
                        </div>
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px shrink-0 bg-white/10" />
                    {/* Content — tagline, contact */}
                    <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-3 text-center lg:px-5 lg:py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 lg:text-xs">
                        Scan for surprise
                      </p>
                      <div className="mt-2 flex flex-wrap justify-center gap-x-3 text-[10px] text-zinc-400 lg:mt-2.5 lg:text-xs">
                        <span>useqr.codes</span>
                      </div>
                    </div>
                    {/* Brand — logo + name at bottom */}
                    <div className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 px-4 py-2.5 lg:py-3">
                      <img
                        src="/logo/svg/logo.svg"
                        alt="UseQR logo"
                        className="h-4 w-4 shrink-0 opacity-90 lg:h-5 lg:w-5"
                      />
                                <span className="text-lg font-semibold tracking-tight">
            Use<span className="font-bold text-emerald-400">QR</span>
          </span>
                      
                    </div>
                  </div>
                </PixelCard>
                </div>

                {/* Scan hint — below card, gentle pulse, fades on hover */}
                <p
                  className="mt-3 text-center text-xs font-medium tracking-wide text-zinc-400 transition-opacity duration-300"
                  style={{ opacity: cardHovered ? 0 : 1 }}
                >
                </p>
              </div>
            </div>
            </section>

            {/* Trust / Social Proof */}
            <section className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
                    Trusted Worldwide
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Built for businesses and individuals who demand quality
                  </h2>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
                    <div className="relative">
                      <div className="text-4xl font-bold text-emerald-400 lg:text-5xl">100%</div>
                      <p className="mt-3 text-sm font-medium text-zinc-300">Free to Start</p>
                      <p className="mt-1 text-xs text-zinc-500">No credit card required</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
                    <div className="relative">
                      <div className="text-4xl font-bold text-emerald-400 lg:text-5xl">∞</div>
                      <p className="mt-3 text-sm font-medium text-zinc-300">Unlimited Scans</p>
                      <p className="mt-1 text-xs text-zinc-500">No scan limits ever</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
                    <div className="relative">
                      <div className="text-4xl font-bold text-emerald-400 lg:text-5xl">24/7</div>
                      <p className="mt-3 text-sm font-medium text-zinc-300">Always Active</p>
                      <p className="mt-1 text-xs text-zinc-500">Your QR codes never sleep</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
                    <div className="relative">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-emerald-400 lg:text-5xl">Real</span>
                        <span className="text-2xl font-bold text-emerald-400">-time</span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-zinc-300">Instant Updates</p>
                      <p className="mt-1 text-xs text-zinc-500">Change content anytime</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Use cases — solid background, no pixel effect */}
            <section id="use-cases" className="relative z-10 w-full overflow-hidden bg-black px-6 py-20 lg:py-28">
              <ScrollFloat
                containerClassName="text-center my-0"
                textClassName="font-bold tracking-tight text-white"
              >
                Smarter QR Codes
              </ScrollFloat>
              <p className="mx-auto mt-6 max-w-xl text-center text-zinc-400">
                From dynamic content and link management to detailed analytics, our platform has you covered.
              </p>
              <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <UseCaseCard
                  label="Use case"
                  number={1}
                  icon={Image}
                  title="Any content"
                  description="Store images, video, links, or web pages in a single QR. No limits—pack what you need."
                  accent="emerald"
                  className="min-h-[260px]"
                />
                <UseCaseCard
                  label="Use case"
                  number={2}
                  icon={Link2}
                  title="Web & links"
                  description="Point to any URL, landing page, or digital asset. One scan, instant access."
                  accent="emerald"
                  className="min-h-[260px]"
                />
                <UseCaseCard
                  label="Use case"
                  number={3}
                  icon={RefreshCw}
                  title="Reusable"
                  description="Update the content behind your QR anytime. Same code, new info—no reprinting."
                  accent="emerald"
                  className="min-h-[260px]"
                />
                <UseCaseCard
                  label="Use case"
                  number={4}
                  icon={UserCircle}
                  title="Get found"
                  description="Put your contact on keys, bags, or gear. Anyone who finds it can reach you."
                  accent="emerald"
                  className="min-h-[260px]"
                />
                <UseCaseCard
                  label="Use case"
                  number={5}
                  icon={Package}
                  title="Print & deliver"
                  description="Order your QR in different styles—stickers, cards, labels. We print and ship."
                  accent="emerald"
                  className="min-h-[260px]"
                />
              </div>
              {/* Bottom fade — use case cards fade to black */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-48 bg-gradient-to-t from-black via-black/80 to-transparent sm:h-56"
                aria-hidden
              />
            </section>

            {/* How it works — premium stepper */}
            <section className="relative z-10 w-full bg-black px-6 py-20 lg:py-28">
              <ScrollFloat
                containerClassName="text-center my-0"
                textClassName="font-bold tracking-tight text-white"
              >
                How it works
              </ScrollFloat>
              <p className="mx-auto mt-6 max-w-xl text-center text-zinc-400">
                Three steps to your first QR. No design skills needed.
              </p>
              <div className="mx-auto mt-12 max-w-4xl">
                <HowItWorksSteps
                  steps={[
                    {
                      number: 1,
                      title: "Create",
                      description:
                        "Choose what to store—a link, image, video, or your contact. Paste a URL or upload a file.",
                    },
                    {
                      number: 2,
                      title: "Customize",
                      description:
                        "Style your QR with colors, shape, and optional logo. Download in high resolution for print.",
                    },
                    {
                      number: 3,
                      title: "Share",
                      description:
                        "Use it anywhere. Update the content anytime—same code, new info. Reuse forever.",
                    },
                    {
                      number: 4,
                      title: "Print & deliver",
                      description:
                        "Order your QR in different styles—stickers, cards, labels. We print and ship.",
                    },
                  ]}
                />
              </div>
            </section>

            {/* Premium QR samples — FlyingPosters */}
            <PremiumQRSamples />

            {/* Pricing — link to /pricing */}
            <section className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-20 lg:py-24">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Plans
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Free to start. From <span className="text-emerald-400">$4</span>/month when you need more.
                </h2>
                <p className="mt-4 text-zinc-400">
                  Compare plans and pick the one that fits. No hidden fees.
                </p>
                <Link
                  href="/pricing"
                  className="mt-8 inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                >
                  See plans & pricing
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <FAQSection
              id="faq"
              title="Frequently asked questions"
              subtitle="Everything you need to know about UseQR."
              items={[
                {
                  question: "What can I put in a QR code?",
                  answer:
                    "Almost anything: URLs, web pages, images, videos, PDFs, plain text, or your contact info. UseQR lets you pack links, media, or a full digital identity into one reusable code.",
                },
                {
                  question: "Can I change the content later?",
                  answer:
                    "Yes. Your QR code stays the same—only the content behind it updates. Change the link, swap the file, or edit your contact details anytime. No need to reprint or create a new code.",
                },
                {
                  question: "Is there a limit on scans?",
                  answer:
                    "No. Once your QR is live, it can be scanned as many times as needed. We don't cap scans, so you can use the same code for events, print, or long-term use.",
                },
                {
                  question: 'How do "get found" / contact QRs work?',
                  answer:
                    'Create a QR that points to your contact details or a simple page. Stick it on keys, bags, or gear. Anyone who finds the item can scan and reach you—no lost items, no awkward "who does this belong to?".',
                },
                {
                  question: "Do I need an account to create a QR?",
                  answer:
                    "You can create and download a QR without signing up. For reusable codes you can update later, saving designs, and managing multiple QRs, an account is required.",
                },
                {
                  question: "Are QR codes safe to scan?",
                  answer:
                    "Yes, QR codes themselves are safe. They're just a way to encode information. However, always check the URL preview before visiting a link. UseQR codes are secure and you control where they point.",
                },
                {
                  question: "Do QR codes expire?",
                  answer:
                    "Static QR codes never expire. Dynamic QR codes from UseQR remain active as long as your account is active. Your codes won't suddenly stop working.",
                },
                {
                  question: "What's the difference between static and dynamic QR codes?",
                  answer:
                    "Static QR codes have fixed content that can't be changed. Dynamic QR codes let you update the destination URL or content anytime without creating a new code. Dynamic codes also provide scan analytics.",
                },
                {
                  question: "Can I track how many people scan my QR code?",
                  answer:
                    "Yes, with dynamic QR codes. You get detailed analytics including total scans, unique users, locations, devices, and scan times. This helps you measure campaign performance.",
                },
                {
                  question: "Do QR codes work without internet?",
                  answer:
                    "Scanning a QR code requires a camera, but accessing the content usually needs internet. However, QR codes with plain text, WiFi passwords, or vCards can work offline since the data is embedded in the code.",
                },
              ]}
            />

            {/* Blog CTA */}
            <section className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-16 lg:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Learn More About QR Codes
                </h2>
                <p className="mt-3 text-zinc-400">
                  Check out our guides and best practices for getting the most out of QR codes.
                </p>
                <Link
                  href="/blog"
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-none border border-white/20 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Read our blog
                </Link>
              </div>
            </section>
            {/* Industry-specific QR code uses */}
            <section className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    QR Codes for <span className="text-emerald-400">Every Industry</span>
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
                    From restaurants to real estate, discover how dynamic QR codes streamline operations and boost engagement across every sector.
                  </p>
                </div>
                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <UtensilsCrossed className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Restaurants & Hospitality</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Digital menus, contactless ordering, table feedback forms, and allergen info—all accessible with one scan. Update menu items and prices instantly without reprinting.
                      </p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <ShoppingBag className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Retail & E-commerce</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Product info, reviews, size guides, and discount codes on packaging or in-store displays. Drive online traffic from physical locations and track engagement.
                      </p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <Building2 className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Real Estate</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Virtual tours, property details, and agent contact on yard signs and flyers. Buyers get instant access 24/7, even when you're not available.
                      </p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <Ticket className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Events & Conferences</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Digital tickets, schedules, speaker bios, and feedback forms. Track attendance and engagement in real-time with scan analytics and attendee insights.
                      </p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <Stethoscope className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Healthcare</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Appointment booking, patient forms, prescription info, and digital health records. Simplify check-ins and reduce paper waste in modern practices.
                      </p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-none border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/15" />
                    <div className="absolute -bottom-8 -left-8 size-28 rounded-full bg-emerald-500/5 blur-3xl transition-all group-hover:bg-emerald-500/10" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/25">
                          <BookOpen className="size-6 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Education</h3>
                      </div>
                      <p className="mt-4 leading-relaxed text-zinc-400">
                        Course materials, assignment links, video tutorials, and resource libraries. Make learning resources instantly accessible to students anytime, anywhere.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Final CTA */}
            <section className="relative z-10 w-full bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  So are you ready to{" "}
                  <span className="">use<span className="font-bold text-emerald-400">QR</span></span>?
                </h2>
                <p className="mt-4 text-zinc-400 sm:text-lg">
                  Create your first QR in seconds. No signup to try.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-none border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </section>

            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            {/* Main content area when sidebar is shown */}
          </div>
        )}
      </main>
    </>
  );
}
