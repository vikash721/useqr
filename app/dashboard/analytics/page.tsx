"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  QrCode,
  TrendingUp,
  Crown,
  Globe,
  Smartphone,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { qrsApi, type QRListItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/stores/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { qrKeys } from "@/lib/query/keys";

function formatContentType(type: string): string {
  const map: Record<string, string> = {
    url: "URL",
    vcard: "vCard",
    wifi: "Wi‑Fi",
    text: "Text",
    email: "Email",
    sms: "SMS",
    phone: "Phone",
    location: "Location",
    event: "Event",
    whatsapp: "WhatsApp",
  };
  return map[type] ?? type;
}

export default function AnalyticsPage() {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  const isFreePlan = user?.plan === "free";

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: qrKeys.list({ limit: 50, skip: 0 }),
    queryFn: () => qrsApi.list({ limit: 50, skip: 0 }),
  });

  const qrs = data?.qrs ?? [];

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a QR code to view its scan analytics and usage.
            </p>
          </div>

          {/* Upgrade Banner for Free Plan */}
          {isFreePlan && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <BarChart3 className="size-6 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Unlock Analytics Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track every scan with detailed insights
                    </p>
                  </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Interactive Graphs
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Visual scan trends & patterns
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-blue-500/10">
                      <Globe className="size-5 text-blue-600 dark:text-blue-500" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Location Analytics
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Country & city-wise data
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-purple-500/10">
                      <Smartphone className="size-5 text-purple-600 dark:text-purple-500" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Device Insights
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      iOS, Android & desktop stats
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="size-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Starter Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Includes CSV export & 60-day retention
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/pricing")}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                  >
                    Upgrade · $4.99/mo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Only show QR list if NOT on free plan */}
          {!isFreePlan && (
            <>
              {loading && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </ul>
              )}

              {!loading && error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6">
                  <p className="text-sm text-destructive">
                    {error instanceof Error ? error.message : "error"}
                  </p>
                </div>
              )}

              {!loading && !error && qrs.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                  <QrCode className="mx-auto size-12 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium text-foreground">
                    No QR codes yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a QR code to start tracking scans.
                  </p>
                  <Link
                    href="/dashboard/create"
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                  >
                    Create QR code
                  </Link>
                </div>
              )}

              {!loading && !error && qrs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    View analytics of which QR code?
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {qrs.map((qr) => (
                      <QrCard key={qr.id} qr={qr} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function QrCard({ qr }: { qr: QRListItem }) {
  return (
    <Link
      href={`/dashboard/analytics/${qr.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:border-emerald-500/40 hover:ring-emerald-500/20"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-emerald-500/15 group-hover:text-emerald-400">
        <QrCode className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {qr.name || "Unnamed QR"}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatContentType(qr.contentType)}</span>
          <span aria-hidden>·</span>
          <span>{qr.scanCount ?? 0} scans</span>
        </p>
      </div>
      <BarChart3 className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-400" />
    </Link>
  );
}
