"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, QrCode } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { qrsApi, type QRListItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [qrs, setQrs] = useState<QRListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    qrsApi
      .list({ limit: 50 })
      .then((data) => {
        if (!cancelled) setQrs(data.qrs);
      })
      .catch((err) => {
        if (!cancelled) {
          setQrs([]);
          setError(err?.response?.data?.error ?? "Failed to load QR codes.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

          {loading && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </ul>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6">
              <p className="text-sm text-destructive">{error}</p>
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
