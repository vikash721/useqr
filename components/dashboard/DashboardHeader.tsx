"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Shared dashboard header — sidebar trigger + optional premium Upgrade button.
 * Pass `showUpgrade={false}` on the pricing page to hide the button.
 */
export function DashboardHeader({ showUpgrade = true }: { showUpgrade?: boolean }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger />
      {showUpgrade && (
        <div className="ml-auto">
          <Link
            href="/dashboard/pricing"
            className="group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-size-[200%_100%] px-4 text-sm font-semibold text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-500 hover:bg-position-[100%_0] hover:shadow-[0_0_28px_rgba(251,191,36,0.45)]"
          >
            <Crown className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span className="tracking-tight">Upgrade</span>
          </Link>
        </div>
      )}
    </header>
  );
}
