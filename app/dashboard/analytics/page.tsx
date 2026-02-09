"use client";

import Link from "next/link";
import { BarChart3, Info, QrCode } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  getDummyQrList,
  formatQrType,
  type QrCodeSummary,
} from "./dummy-data";

export default function AnalyticsPage() {
  const qrList = getDummyQrList();

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
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-200/90">
              <span className="font-medium text-amber-400">Heads up!</span>{" "}
              The data shown here is for demonstration purposes only and does not
              reflect your actual analytics. We&apos;re actively working on
              bringing real-time data to this page.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              View analytics of which QR code?
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {qrList.map((qr) => (
                <QrCard key={qr.id} qr={qr} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function QrCard({ qr }: { qr: QrCodeSummary }) {
  return (
    <Link
      href={`/dashboard/analytics/${qr.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-border/50 transition-colors hover:border-emerald-500/40 hover:ring-emerald-500/20"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-emerald-500/15 group-hover:text-emerald-400">
        <QrCode className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{qr.title}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatQrType(qr.type)}</span>
          <span aria-hidden>·</span>
          <span>{qr.totalScans} scans</span>
        </p>
      </div>
      <BarChart3 className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-400" />
    </Link>
  );
}
