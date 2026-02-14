"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

export default function AboutPage() {
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
                  About{" "}
                  <span className="text-emerald-400">UseQR</span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  The modern QR code platform — create, customize, and manage dynamic QR codes for any purpose.
                </p>
              </div>
            </section>

            {/* What is UseQR */}
            <section className="w-full bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  What is UseQR? A Dynamic QR Code Platform
                </h2>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  UseQR is a modern QR code platform built for people who want
                  more than a static link. You can store images, video, web
                  pages, plain text, or your contact details in a single QR code.
                  Every code is reusable—update the content behind it anytime
                  without changing the code or reprinting. Put your contact on
                  keys, bags, or gear so anyone who finds it can reach you. One
                  code, any content, yours forever. Learn more in our{" "}
                  <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    QR code blog
                  </Link>.
                </p>
              </div>
            </section>

            {/* Why we built it */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Why we built it
                </h2>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  Most QR tools only do links. We wanted one place to pack
                  anything—a menu, a video, a PDF, or your identity—into a single
                  code you can reuse and update. No more “this QR is outdated” or
                  “I need a new code for every change.” UseQR gives you custom,
                  editable QR codes that look good and work everywhere: print,
                  screens, stickers, or objects. So you spend less time managing
                  codes and more time sharing what matters.
                </p>
              </div>
            </section>

            {/* What you can do */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  What you can do
                </h2>
                <ul className="mt-6 space-y-4 text-zinc-400">
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                    <span>
                      <strong className="text-white">Any content.</strong> Put
                      links, images, video, PDFs, or plain text in one QR. No
                      limits on type—just add what you need.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                    <span>
                      <strong className="text-white">Reusable.</strong> Change
                      the content behind your QR anytime. Same code, new info—no
                      reprinting or new links.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                    <span>
                      <strong className="text-white">Get found.</strong> Store
                      your contact in a QR and stick it on keys, bags, or gear.
                      Anyone who finds it can scan and reach you.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                    <span>
                      <strong className="text-white">Customize.</strong> Style
                      your QR with colors, shapes, and optional logo. Download
                      in high resolution for print.{" "}
                      <Link href="/designs" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        Explore design options
                      </Link>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                    <span>
                      <strong className="text-white">Print & deliver.</strong> We
                      handle logistics: order your QR in different styles—stickers,
                      cards, labels, or signage—and get it printed and delivered
                      to your door.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Print & deliver — logistics */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Print & deliver
                </h2>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  UseQR doesn’t stop at digital. We handle logistics so you can
                  order your QR codes in different styles and get them printed and
                  delivered. Choose from stickers, cards, labels, table tents,
                  or signage—in the size and finish you need. We take care of
                  printing and shipping so you can focus on using your codes.
                  Create once online, then get physical QRs delivered to your
                  door.{" "}
                  <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    View pricing plans
                  </Link>.
                </p>
              </div>
            </section>

            {/* Who it's for */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Who it&apos;s for
                </h2>
                <p className="mt-4 leading-relaxed text-zinc-400">
                  UseQR is for anyone who needs flexible, lasting QR codes:
                  creators sharing portfolios or media, businesses updating
                  menus or promos without reprinting, event organizers pointing
                  to schedules or forms, and everyday users who want their
                  contact on lost-and-found items. If you want one code that can
                  hold anything and change when you do, UseQR is built for you.
                </p>
              </div>
            </section>

            {/* CTA */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to use UseQR?
                </h2>
                <p className="mt-4 text-zinc-400">
                  Create your first QR in seconds. No signup to try.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/"
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
            <p className="text-zinc-400">About UseQR</p>
          </div>
        )}
      </main>
    </>
  );
}
