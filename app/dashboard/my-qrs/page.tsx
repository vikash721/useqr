"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Grid2X2,
  List,
  Loader2,
  QrCode,
  Search,
  SlidersHorizontal,
  Plus,
  ExternalLink,
  Eye,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { qrsApi, type QRListItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { QRTemplateId } from "@/lib/qr";

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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function MyQRsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [qrs, setQrs] = useState<QRListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    qrsApi
      .list({ limit: 50, skip: 0 })
      .then((data) => {
        if (cancelled) return;
        setQrs(data.qrs);
        setTotal(data.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setQrs([]);
        setTotal(0);
        setError(
          err?.response?.data?.error ?? "Failed to load QR codes. Try again."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = qrs.filter((q) => q.status === "active").length;
  const totalScans = qrs.reduce((sum, q) => sum + (q.scanCount ?? 0), 0);

  const stats = [
    { label: "Total QRs", value: loading ? "—" : String(total) },
    { label: "Active", value: loading ? "—" : String(activeCount) },
    { label: "Total scans", value: loading ? "—" : String(totalScans) },
    { label: "This month", value: "—" },
  ];

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Title row */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              My QR Codes
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage, edit, and track all your QR codes in one place.
            </p>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search QR codes..."
                className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/create"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2"
              >
                <Plus className="size-4" />
                Create QR
              </Link>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <SlidersHorizontal className="size-3.5" />
                Filter
              </button>
              <div className="flex items-center rounded-md border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-l-md text-muted-foreground transition-colors",
                    view === "grid" && "bg-muted/60 text-foreground"
                  )}
                  aria-label="Grid view"
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-r-md border-l border-border text-muted-foreground transition-colors",
                    view === "list" && "bg-muted/60 text-foreground"
                  )}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-4 shadow-sm ring-1 ring-border/50"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {loading ? (
                  <Skeleton className="mt-1 h-7 w-12 rounded-md" />
                ) : (
                  <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Content: loading / error / list / empty */}
          {loading && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 rounded-xl border border-border"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-sm font-medium text-foreground underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && qrs.length > 0 && (
            <div
              className={cn(
                "mt-8",
                view === "grid"
                  ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              )}
            >
              {qrs.map((qr) => (
                <article
                  key={qr.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md",
                    view === "list" &&
                      "flex flex-row items-center gap-6 py-1"
                  )}
                >
                  {/* QR thumbnail */}
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center border-border bg-muted/20",
                      view === "grid"
                        ? "w-full rounded-t-2xl border-b p-6"
                        : "m-4 size-24 rounded-xl border p-2"
                    )}
                  >
                    <QRCodePreview
                      qrId={qr.id}
                      templateId={(qr.template || "classic") as QRTemplateId}
                      size={view === "grid" ? 128 : 80}
                      compact
                      className="shrink-0"
                    />
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      "min-w-0 flex-1",
                      view === "grid" ? "px-5 pb-5 pt-1" : "py-4 pr-4"
                    )}
                  >
                    <Link
                      href={`/dashboard/my-qr/${qr.id}`}
                      className="focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 rounded-md"
                    >
                      <h3 className="truncate text-base font-semibold text-foreground transition-colors hover:text-emerald-600 sm:text-lg">
                        {qr.name || "Unnamed QR"}
                      </h3>
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex rounded-full bg-muted/80 px-2.5 py-0.5 font-medium text-foreground/90">
                        {formatContentType(qr.contentType)}
                      </span>
                      <span>{qr.scanCount ?? 0} scans</span>
                      <span>{formatDate(qr.createdAt)}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/my-qr/${qr.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                      >
                        <Eye className="size-4" />
                        View
                      </Link>
                      {/* <a
                        href={`/q/${qr.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                      >
                        <ExternalLink className="size-4" />
                        Open
                      </a> */}
                      <Link
                        href={`/dashboard/create?edit=${qr.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && qrs.length === 0 && (
            <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center shadow-sm">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-muted/40">
                <QrCode className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-base font-semibold text-foreground">
                No QR codes yet
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create your first QR code to store a link, image, video, or
                contact. It&apos;ll show up here so you can manage and track it.
              </p>
              <Link
                href="/dashboard/create"
                className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <Plus className="size-4" />
                Create your first QR
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                Free plan includes 2 QR codes.{" "}
                <Link
                  href="/dashboard/pricing"
                  className="text-emerald-500 transition-colors hover:text-emerald-400"
                >
                  See all plans
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
