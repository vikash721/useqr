"use client";

import Link from "next/link";
import { Palette, ImagePlus, Package } from "lucide-react";
import { PremiumQRSamples } from "@/components/PremiumQRSamples";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

export default function DesignsPage() {
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
          <div className="relative">
            {/* Hero */}
            <section className="w-full border-b border-white/10 bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Design your QR
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Colors, shapes, optional logo—and physical styles for print.
                </p>
              </div>
            </section>

            {/* Premium samples — animated FlyingPosters */}
            <PremiumQRSamples sectionId="samples" />

            {/* Colors & shapes */}
            <section
              id="colors"
              className="w-full bg-black px-6 py-16 lg:py-24"
            >
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded border border-white/10 bg-white/5">
                    <Palette className="size-5 text-emerald-400" aria-hidden />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Colors & shapes
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Style your QR to match your brand. Choose foreground and
                  background colors, corner style, and module shape. Pro and
                  Business plans include custom colors and optional logo in the
                  center. Download in high resolution for print or digital use.
                </p>
              </div>
            </section>

            {/* Logo */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded border border-white/10 bg-white/5">
                    <ImagePlus
                      className="size-5 text-emerald-400"
                      aria-hidden
                    />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Add your logo
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Put your logo in the center of the QR so it&apos;s instantly
                  recognizable. Available on Pro and Business plans. The code
                  stays scannable while your brand stays front and center.
                </p>
              </div>
            </section>

            {/* Print styles */}
            <section
              id="print"
              className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24"
            >
              <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded border border-white/10 bg-white/5">
                    <Package className="size-5 text-emerald-400" aria-hidden />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Print & physical styles
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Order your QR in different formats and get it printed and
                  delivered. Choose from stickers, cards, labels, table tents,
                  or signage—in the size and finish you need. We handle printing
                  and shipping so you can focus on using your codes.
                </p>
              </div>
            </section>

            {/* CTA */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to design?
                </h2>
                <p className="mt-4 text-zinc-400">
                  Create your first QR and style it in minutes.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Create your QR
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex h-11 items-center justify-center rounded-none border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    See plans
                  </Link>
                </div>
              </div>
            </section>

            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-zinc-400">Designs</p>
          </div>
        )}
      </main>
    </>
  );
}
