"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WaitlistScreen } from "@/components/dashboard/WaitlistScreen";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <WaitlistScreen />
    </>
  );
}
