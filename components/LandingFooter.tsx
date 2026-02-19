"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppUnderDevelopmentModal } from "@/components/modals/AppUnderDevelopmentModal";

const FOOTER_LINKS = {
  product: [
    { label: "Designs", href: "/designs" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Download", href: "#" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
} as const;

export function LandingFooter() {
  const year = new Date().getFullYear();
  const [appModalOpen, setAppModalOpen] = useState(false);

  return (
    <>
    <footer className="relative z-10 w-full border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
            >
              <Image
                src="/logo/svg/logo.svg"
                alt="UseQR - Dynamic QR Code Platform"
                width={28}
                height={28}
                className="size-7 shrink-0"
              />
              <span className="text-lg font-semibold tracking-tight">
                Use<span className="font-bold text-emerald-400">QR</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-500">
              One QR. Any content. Yours forever.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Product
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map((item) => (
                <li key={item.label}>
                  {item.label === "Download" ? (
                    <button
                      type="button"
                      onClick={() => setAppModalOpen(true)}
                      className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {year} UseQR. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-400"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-400"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>

    <AppUnderDevelopmentModal
      open={appModalOpen}
      onOpenChange={setAppModalOpen}
    />
    </>
  );
}
