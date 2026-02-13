"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/useUserStore";

function formatPlanLabel(plan: string) {
  const p = plan?.toLowerCase() ?? "free";
  if (p === "pro" || p === "business" || p === "starter") return p.charAt(0).toUpperCase() + p.slice(1);
  return "Free";
}

/**
 * Shared dashboard header — sidebar trigger + optional premium Upgrade button or current plan pill.
 * Pass `showUpgrade={false}` on the pricing page to hide the button.
 * When user has a paid plan, shows "Your plan: Pro" (or Starter/Business) instead of Upgrade.
 */
export function DashboardHeader({ showUpgrade = true }: { showUpgrade?: boolean }) {
  const storeUser = useUserStore((s) => s.user);
  const plan = storeUser?.plan?.toLowerCase() ?? "free";
  const hasPaidPlan = plan === "starter" || plan === "pro" || plan === "business";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger />
      {showUpgrade && (
        <div className="ml-auto">
          {hasPaidPlan ? (
            <Link
              href="/dashboard/pricing"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="tracking-tight">{formatPlanLabel(plan)}</span>
              <span className="text-xs text-muted-foreground/80">· current</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/pricing"
              className="group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 bg-size-[200%_100%] px-4 text-sm font-semibold text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-500 hover:bg-position-[100%_0] hover:shadow-[0_0_28px_rgba(251,191,36,0.45)]"
            >
              <Crown className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
              <span className="tracking-tight">Upgrade</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
