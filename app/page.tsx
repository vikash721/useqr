"use client";

import { useEffect, useRef, useState } from "react";
import { Image, Link2, Package, RefreshCw, UserCircle } from "lucide-react";
import Link from "next/link";
import DynamicLandingQR from "@/components/DynamicLandingQR";
import PixelBlast from "@/components/PixelBlast";
import PixelCard from "@/components/PixelCard";
import LetterGlitch from "@/components/LetterGlitch";
import { FAQSection } from "@/components/FAQSection";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import ScrollFloat from "@/components/ScrollFloat";
import { UseCaseCard } from "@/components/UseCaseCard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/axios";
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

const POLL_INTERVAL_MS = 4000;

export default function Home() {
  const showHeader = useShouldShowHeader();
  const qrId = useScanStore((s) => s.qrId);
  const scanStatus = useScanStore((s) => s.scanStatus);
  const initQrId = useScanStore((s) => s.initQrId);
  const setScanStatus = useScanStore((s) => s.setScanStatus);
  const reset = useScanStore((s) => s.reset);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init stable qrId when landing is shown
  useEffect(() => {
    if (!showHeader) initQrId();
  }, [showHeader, initQrId]);

  // Poll scan status when we have qrId and not yet scanned
  useEffect(() => {
    if (showHeader || !qrId || scanStatus?.scanned) return;
    const poll = () => {
      api.get<{ scanned: boolean; scannedAt?: number }>(`/api/scan/status?qrId=${encodeURIComponent(qrId)}`).then((res) => {
        setScanStatus(res.data);
        if (res.data.scanned && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }).catch(() => {});
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [showHeader, qrId, scanStatus?.scanned, setScanStatus]);

  // Development notice on landing — show on every refresh/visit (delay so Toaster is mounted)
  useEffect(() => {
    if (!showHeader) {
      const timer = setTimeout(() => {
        showDevelopmentNotice();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showHeader]);

  return (
    <>
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
                  One QR. Any content.{" "}
                  <span className="text-emerald-400">Yours forever.</span>
                </h1>
                <p className="text-lg text-zinc-400 sm:text-xl">
                  Store Images, video, links, or your contact—one QR holds it all.
                  Reuse it. Stick it anywhere. Get found.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <a
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-none bg-emerald-500 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Get started
                  </a>
                  <a
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-none border border-white/20 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Learn more
                  </a>
                </div>
              </div>
              <div className="relative flex shrink-0 flex-col items-center">
                <PixelCard
                  variant="default"
                  colors="#94a3b8,#64748b,#475569"
                  gap={6}
                  speed={30}
                  className="h-[340px] w-[280px] rounded-none border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/30 lg:h-[380px] lg:w-[300px]"
                >
                  {/* Thank you overlay when scanned */}
                  {scanStatus?.scanned && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-none bg-zinc-900/95 px-4">
                      <p className="text-center text-lg font-semibold text-white">
                        Thank you
                      </p>
                      <p className="text-center text-sm text-zinc-400">
                        Thanks for scanning.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          reset();
                          initQrId();
                        }}
                        className="rounded-none border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Scan again
                      </button>
                    </div>
                  )}
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
                          <DynamicLandingQR qrId={qrId} />
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
                        alt=""
                        className="h-4 w-4 shrink-0 opacity-90 lg:h-5 lg:w-5"
                      />
                                <span className="text-lg font-semibold tracking-tight">
            Use<span className="font-bold text-emerald-400">QR</span>
          </span>
                      
                    </div>
                  </div>
                </PixelCard>
              </div>
            </div>
            </section>

            {/* Use cases — solid background, no pixel effect */}
            <section className="relative z-10 w-full overflow-hidden bg-black px-6 py-20 lg:py-28">
              <ScrollFloat
                containerClassName="text-center my-0"
                textClassName="font-bold tracking-tight text-white"
              >
                One code. Many uses.
              </ScrollFloat>
              <p className="mx-auto mt-6 max-w-xl text-center text-zinc-400">
                Custom QR codes that fit how you work—store anything, reuse forever, get found.
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

            {/* Pricing — link to /pricing */}
            <section className="relative z-10 w-full border-t border-white/10 bg-black px-6 py-20 lg:py-24">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Plans
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Free to start. From <span className="text-emerald-400">$2</span>/month when you need more.
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
                    "No. Once your QR is live, it can be scanned as many times as needed. We don’t cap scans, so you can use the same code for events, print, or long-term use.",
                },
                {
                  question: "How do “get found” / contact QRs work?",
                  answer:
                    "Create a QR that points to your contact details or a simple page. Stick it on keys, bags, or gear. Anyone who finds the item can scan and reach you—no lost items, no awkward “who does this belong to?”.",
                },
                {
                  question: "Do I need an account to create a QR?",
                  answer:
                    "You can create and download a QR without signing up. For reusable codes you can update later, saving designs, and managing multiple QRs, an account is required.",
                },
              ]}
            />

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
                  <a
                    href="#"
                    className="inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Get started
                  </a>
                  <a
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-none border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Log in
                  </a>
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
