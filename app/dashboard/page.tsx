"use client";

import Link from "next/link";
import {
  BarChart3,
  Plus,
  QrCode,
  ScanLine,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { qrsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function DashboardPage() {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: qrKeys.list({ limit: 50, skip: 0 }),
    queryFn: () => qrsApi.list({ limit: 50, skip: 0 }),
  });

  const qrs = data?.qrs ?? [];
  const total = data?.total ?? 0;

  const activeCount = qrs.filter((q) => q.status === "active").length;
  const totalScans = qrs.reduce((sum, q) => sum + (q.scanCount ?? 0), 0);
  const recentQrs = qrs.slice(0, 5);

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of your QR codes and scan activity.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Total QRs"
              value={loading ? "—" : String(total)}
              icon={LayoutGrid}
              loading={loading}
            />
            <StatCard
              label="Active"
              value={loading ? "—" : String(activeCount)}
              icon={QrCode}
              loading={loading}
            />
            <StatCard
              label="Total scans"
              value={loading ? "—" : String(totalScans)}
              icon={ScanLine}
              loading={loading}
            />
          </div>

          {error && (
            <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-center">
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load dashboard data."}
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/dashboard/create"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-border/50 transition-all hover:border-emerald-500/40 hover:shadow-md"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Plus className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    Create QR code
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    New link, contact, or content
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </Link>
              <Link
                href="/dashboard/my-qrs"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-border/50 transition-all hover:border-emerald-500/40 hover:shadow-md"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500">
                  <LayoutGrid className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">My QR codes</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Manage and edit all QRs
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </Link>
              <Link
                href="/dashboard/analytics"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-border/50 transition-all hover:border-emerald-500/40 hover:shadow-md"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500">
                  <BarChart3 className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">Analytics</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Scan stats and insights
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </Link>
            </div>
          </div>

          {/* Recent QR codes */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent QR codes
              </h2>
              {total > 0 && (
                <Link
                  href="/dashboard/my-qrs"
                  className="text-xs font-medium text-emerald-500 hover:text-emerald-400"
                >
                  View all
                </Link>
              )}
            </div>

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            )}

            {!loading && recentQrs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                <QrCode className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  No QR codes yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first QR to get started.
                </p>
                <Link
                  href="/dashboard/create"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <Plus className="size-4" />
                  Create QR code
                </Link>
              </div>
            )}

            {!loading && recentQrs.length > 0 && (
              <div className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-border/50 overflow-hidden">
                <ul className="divide-y divide-border">
                  {recentQrs.map((qr) => (
                    <li key={qr.id}>
                      <Link
                        href={`/dashboard/my-qr/${qr.id}`}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-6"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
                          <QrCode className="size-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {qr.name || "Unnamed QR"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {formatContentType(qr.contentType)} ·{" "}
                            {qr.scanCount ?? 0} scans
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-border/50">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-12 rounded-md" />
      ) : (
        <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          {value}
        </p>
      )}
    </div>
  );
}
