"use client";

import { ExternalLink, Link2 } from "lucide-react";
import type { ScansByReferrer } from "@/lib/api";

/** Extract a short display label from a full referrer URL. */
function shortenReferrer(raw: string): string {
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "");
  } catch {
    // Not a valid URL — return as-is (e.g. "android-app://com.google")
    return raw.length > 40 ? raw.slice(0, 37) + "…" : raw;
  }
}

export function ReferrerList({ data }: { data: ScansByReferrer[] }) {
  const total = data.reduce((s, d) => s + d.scans, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Link2 className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          No referrer data yet
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Top referrers will appear once scans come from external links.
        </p>
      </div>
    );
  }

  const maxScans = Math.max(...data.map((d) => d.scans));

  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => {
        const pct = total > 0 ? ((d.scans / total) * 100).toFixed(1) : "0";
        const barWidth = maxScans > 0 ? (d.scans / maxScans) * 100 : 0;
        const label = shortenReferrer(d.referrer);

        return (
          <li key={d.referrer} className="group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                <span
                  className="truncate text-sm text-foreground"
                  title={d.referrer}
                >
                  {label}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="tabular-nums text-sm font-medium text-foreground">
                  {d.scans}
                </span>
                <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                  {pct}%
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
