"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Grid2X2,
  List,
  QrCode,
  Search,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRComingSoonModal } from "@/components/modals";
import { cn } from "@/lib/utils";

export default function MyQRsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [qrModalOpen, setQrModalOpen] = useState(false);

  return (
    <>
      <DashboardHeader />

      {/* ---- Page content ---- */}
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
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search QR codes..."
                className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
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
            {[
              { label: "Total QRs", value: "0" },
              { label: "Active", value: "0" },
              { label: "Total scans", value: "0" },
              { label: "This month", value: "0" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-4 shadow-sm ring-1 ring-border/50"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Empty state */}
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
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="mt-8 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Plus className="size-4" />
              Create your first QR
            </button>
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
        </div>
      </div>

      <QRComingSoonModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
    </>
  );
}
