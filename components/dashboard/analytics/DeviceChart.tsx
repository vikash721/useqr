"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { ScansByDevice } from "@/lib/api";

const DEVICE_COLORS: Record<string, string> = {
  mobile: "hsl(160 84% 39%)",   // emerald
  desktop: "hsl(217 91% 60%)",  // blue
  tablet: "hsl(280 67% 60%)",   // purple
};

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
};

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DeviceChart({ data }: { data: ScansByDevice[] }) {
  const total = data.reduce((s, d) => s + d.scans, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Smartphone className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          No device data yet
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Device breakdown will appear after scans are recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center gap-4 sm:flex-row sm:gap-6">
      {/* Donut chart */}
      <div className="h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="scans"
              nameKey="device"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.device}
                  fill={DEVICE_COLORS[entry.device] ?? "hsl(0 0% 60%)"}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]!.payload as ScansByDevice;
                const pct = total > 0 ? ((d.scans / total) * 100).toFixed(1) : "0";
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">
                      {capitalise(d.device)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {d.scans} scan{d.scans !== 1 ? "s" : ""}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({pct}%)
                      </span>
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-2.5">
        {data.map((d) => {
          const Icon = DEVICE_ICONS[d.device] ?? Smartphone;
          const pct = total > 0 ? ((d.scans / total) * 100).toFixed(1) : "0";
          return (
            <li key={d.device} className="flex items-center gap-2.5">
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    DEVICE_COLORS[d.device] ?? "hsl(0 0% 60%)",
                }}
              />
              <Icon className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {capitalise(d.device)}
              </span>
              <span className="ml-auto tabular-nums text-sm font-medium text-foreground">
                {d.scans}
              </span>
              <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
