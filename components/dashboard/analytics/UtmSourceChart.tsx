"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Megaphone } from "lucide-react";
import type { ScansByUtmSource } from "@/lib/api";

const CHART_COLORS = {
  bar: "hsl(217 91% 60%)",
  grid: "hsl(0 0% 50% / 0.2)",
  axis: "hsl(0 0% 65%)",
} as const;

export function UtmSourceChart({ data }: { data: ScansByUtmSource[] }) {
  const total = data.reduce((s, d) => s + d.scans, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Megaphone className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          No UTM data yet
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add <code className="rounded bg-muted px-1 text-[11px]">?utm_source=…</code> to your
          QR link to track campaign sources.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    source: d.source,
    scans: d.scans,
  }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="source"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]!.payload as { source: string; scans: number };
              const pct = total > 0 ? ((d.scans / total) * 100).toFixed(1) : "0";
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">{d.source}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {d.scans} scan{d.scans !== 1 ? "s" : ""}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({pct}%)
                    </span>
                  </p>
                </div>
              );
            }}
            cursor={{ fill: "hsl(0 0% 100% / 0.05)" }}
          />
          <Bar
            dataKey="scans"
            fill={CHART_COLORS.bar}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
