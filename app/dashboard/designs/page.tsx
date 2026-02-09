"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DesignsContent } from "@/components/DesignsContent";

export default function DashboardDesignsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex-1 overflow-y-auto">
        <DesignsContent showCta={false} />
      </div>
    </>
  );
}
