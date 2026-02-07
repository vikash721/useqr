"use client";

import { useUser } from "@clerk/nextjs";
import { useUserStore } from "@/stores/useUserStore";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const appUser = useUserStore((s) => s.user);

  const displayName = appUser?.name ?? clerkUser?.fullName ?? "User";
  const email = appUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? null;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger />
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{displayName ? `, ${displayName}` : ""}.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">
          {email ? `Signed in as ${email}` : "Main app — sidebar and header are shown here."}
        </p>
      </div>
    </div>
    </>
  );
}
