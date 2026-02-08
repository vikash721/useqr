"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { WaitlistScreen } from "@/components/dashboard/WaitlistScreen";

export default function DashboardPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger />
      </header>
      <WaitlistScreen />
    </>
  );
}
