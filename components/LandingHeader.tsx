"use client";

import { ChevronDown, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AppUnderDevelopmentModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavLink =
  | { label: string; href: string }
  | {
      label: string;
      href: string;
      hasDropdown: true;
      dropdownItems: { label: string; href: string }[];
    };

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },

  {
    label: "Designs",
    href: "/designs",
    hasDropdown: true,
    dropdownItems: [
      { label: "Overview", href: "/designs" },
      { label: "Premium samples", href: "/designs#samples" },
      { label: "Colors & logo", href: "/designs#colors" },
      { label: "Print styles", href: "/designs#print" },
    ],
  },
  { label: "Blog", href: "/blog" },
  {
    label: "Resources",
    href: "/blog",
    hasDropdown: true,
    dropdownItems: [
      { label: "Blog", href: "/blog" },
      { label: "Pitch deck", href: "https://drive.google.com/file/d/1dNM5s7myTe2Y715Q4npllmTfxItJ3zFv/view?usp=drive_link" },
      { label: "FAQ", href: "/#faq" },
      { label: "Use cases", href: "/#use-cases" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function LandingHeader() {
  const [appModalOpen, setAppModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/10 bg-black/95 px-6 backdrop-blur supports-backdrop-filter:bg-black/80">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo/svg/logo.svg"
            alt="UseQR"
            width={28}
            height={28}
            className="size-7 shrink-0 transition-transform group-hover:scale-[1.02]"
          />
          <span className="text-lg font-semibold tracking-tight">
            Use<span className="font-bold text-emerald-400">QR</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <div key={item.label}>
              {"hasDropdown" in item && item.hasDropdown ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-0.5 text-sm text-zinc-400 transition-colors hover:text-white focus:outline-none focus:ring-0"
                    >
                      {item.label}
                      <ChevronDown className="size-4 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="min-w-40 rounded-none border-white/10 bg-zinc-900"
                  >
                    {item.dropdownItems?.map((sub) => {
                      const isExternal = sub.href.startsWith("http");
                      return (
                        <DropdownMenuItem asChild key={sub.label}>
                          <Link
                            href={sub.href}
                            className="cursor-pointer text-zinc-300 focus:bg-white/5 focus:text-white"
                            {...(isExternal && {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            })}
                          >
                            {sub.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Gift link + Log in + Download */}
      <div className="flex items-center gap-6">
        <Link
          href="/signup"
          className="hidden items-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex"
        >
          <Gift className="size-4 text-emerald-500" />
          Claim your free QR
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="default"
            className="rounded-none bg-zinc-800/90 text-white hover:bg-zinc-700"
            asChild
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            size="default"
            type="button"
            className="rounded-none cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => setAppModalOpen(true)}
          >
            Get App
          </Button>
        </div>
      </div>
    </header>
      <AppUnderDevelopmentModal
        open={appModalOpen}
        onOpenChange={setAppModalOpen}
      />
    </>
  );
}
