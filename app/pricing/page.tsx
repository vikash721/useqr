"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { PricingContent } from "@/components/PricingContent";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

export default function PricingPage() {
  const showHeader = useShouldShowHeader();

  return (
    <>
      {showHeader ? (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
      ) : null}
      <main className="relative flex-1">
        {!showHeader ? (
          <div className="relative">
            <PricingContent />
            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-zinc-400">Pricing</p>
          </div>
        )}
      </main>
    </>
  );
}
