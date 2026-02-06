"use client";

import { useEffect, useState } from "react";
import PixelBlast from "@/components/PixelBlast";
import PixelCard from "@/components/PixelCard";
import LetterGlitch from "@/components/LetterGlitch";
import MetallicPaint from "@/components/MetallicPaint";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

export default function Home() {
  const showHeader = useShouldShowHeader();

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
          <section className="relative flex min-h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center overflow-hidden px-6 py-20">
            <div className="absolute inset-0 z-0 will-change-auto">
              <HeroBackground />
            </div>
            <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                  Create & scan QR codes{" "}
                  <span className="text-emerald-400">in seconds</span>
                </h1>
                <p className="text-lg text-zinc-400 sm:text-xl">
                  UseQR makes it simple to generate, customize, and share QR codes
                  for links, WiFi, and more.
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
              <div className="flex shrink-0 flex-col items-center">
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
                          <MetallicPaint
                            imageSrc="/qr-code.svg"
                            lightColor="#e2e8f0"
                            darkColor="#1e293b"
                            brightness={1.6}
                            contrast={0.4}
                            scale={3.5}
                            refraction={0.005}
                            blur={0.008}
                            liquid={0.35}
                            speed={0.15}
                            waveAmplitude={0.35}
                            chromaticSpread={0.7}
                            tintColor="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px shrink-0 bg-white/10" />
                    {/* Content — tagline, contact */}
                    <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-3 text-center lg:px-5 lg:py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 lg:text-xs">
                        Create & scan QR codes
                      </p>
                      <div className="mt-2 flex flex-wrap justify-center gap-x-3 text-[10px] text-zinc-400 lg:mt-2.5 lg:text-xs">
                        <span>hello@useqr.app</span>
                        <span className="text-white/30">·</span>
                        <span>useqr.app</span>
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
        ) : (
          <div className="p-4">
            {/* Main content area when sidebar is shown */}
          </div>
        )}
      </main>
    </>
  );
}
