"use client";


import Link from "next/link";
import { BarChart3, ChevronRight, Loader2, ScanLine, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useEnableAnalytics } from "@/lib/query/mutations";

export interface QRBasicAnalyticsProps {
  qrId: string;
  analyticsEnabled: boolean;
  scanCount: number;
  /** Called after analytics is turned on so parent can refetch */
  onAnalyticsChange?: () => void;
  className?: string;
}

/**
 * Compact analytics block for QR detail view.
 * When on: shows basic scan count + link to full analytics.
 * When off: clear message + option to turn on.
 */
export function QRBasicAnalytics({
  qrId,
  analyticsEnabled,
  scanCount,
  onAnalyticsChange,
  className,
}: QRBasicAnalyticsProps) {
  const enableAnalytics = useEnableAnalytics(qrId);

  const handleTurnOn = async () => {
    try {
      await enableAnalytics.mutateAsync();
      toast.success("Analytics enabled.");
      onAnalyticsChange?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Could not enable analytics. Try again.";
      toast.error(msg);
    }
  };

  if (analyticsEnabled) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
          className
        )}
        aria-labelledby="qr-analytics-heading"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="size-5" aria-hidden />
              </div>
              <div>
                <h2
                  id="qr-analytics-heading"
                  className="text-sm font-semibold text-foreground"
                >
                  Analytics
                </h2>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                  {scanCount}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    total scans
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scan data is being collected. View charts and breakdowns in
                  detailed analytics.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 gap-2 bg-emerald-500 hover:bg-emerald-600">
              <Link href={`/dashboard/analytics/${qrId}`}>
                View detailed analytics
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/20 overflow-hidden",
        className
      )}
      aria-labelledby="qr-analytics-off-heading"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ScanLine className="size-5" aria-hidden />
            </div>
            <div>
              <h2
                id="qr-analytics-off-heading"
                className="text-sm font-semibold text-foreground"
              >
                Analytics is off
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enable analytics to track how many times this QR code is scanned
                and view detailed insights.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            onClick={handleTurnOn}
            disabled={enableAnalytics.isPending}
          >
            {enableAnalytics.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <TrendingUp className="size-4" />
            )}
            Turn on analytics
          </Button>
        </div>
      </div>
    </section>
  );
}
