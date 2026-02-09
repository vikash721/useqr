"use client";

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

const CONTACT_EMAIL = "useqr.codes@gmail.com";

export default function ContactPage() {
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
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Contact <span className="text-emerald-400">Us</span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Get in touch. We&apos;re here to help.
                </p>
              </div>
            </section>

            {/* Contact detail */}
            <section className="w-full bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-xl">
                <div className="rounded border border-white/10 bg-white/5 p-8 text-center sm:p-10">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-white/10 bg-black">
                    <Mail className="size-5 text-emerald-400" aria-hidden />
                  </div>
                  <h2 className="mt-6 text-lg font-semibold text-white">
                    Email us
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Questions, partnerships, or support. We typically respond
                    within 1–2 business days.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-none border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-400 transition-colors hover:border-emerald-500 hover:bg-emerald-500/20"
                  >
                    <Mail className="size-4" aria-hidden />
                    {CONTACT_EMAIL}
                  </a>
                </div>

                <p className="mt-8 text-center text-sm text-zinc-500">
                  Prefer to get started?{" "}
                  <Link
                    href="/"
                    className="text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Create your first QR
                  </Link>
                </p>
              </div>
            </section>

            {/* Back */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-12">
              <div className="mx-auto max-w-2xl text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back to home
                </Link>
              </div>
            </section>

            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-zinc-400">Contact</p>
          </div>
        )}
      </main>
    </>
  );
}
