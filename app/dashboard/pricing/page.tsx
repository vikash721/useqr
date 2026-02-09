"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PricingContent } from "@/components/PricingContent";

export default function DashboardPricingPage() {
  return (
    <>
      <DashboardHeader showUpgrade={false} />
      <div className="flex-1 overflow-y-auto">
        <PricingContent showCta={false} />
      </div>
    </>
  );
}
