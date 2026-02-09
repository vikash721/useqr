"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, BarChart3, Calendar, CalendarRange, Check, ChevronDown, Info, QrCode, Scan } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  getDummyQrAnalytics,
  formatQrType,
  type ScanByDay,
} from "../dummy-data";
import { cn } from "@/lib/utils";

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateRangeFromScans(scansByDay: ScanByDay[]) {
  if (scansByDay.length === 0) return { min: "", max: "" };
  const dates = scansByDay.map((d) => d.date);
  return { min: dates[0]!, max: dates[dates.length - 1]! };
}

type Preset = "last7" | "thisMonth" | "lastMonth" | "allTime" | "custom";

const PRESET_LABELS: Record<Preset, string> = {
  last7: "Last 7 days",
  thisMonth: "This month",
  lastMonth: "Last month",
  allTime: "All time",
  custom: "Custom range",
};

function getPresetRange(
  preset: Preset,
  createdAt: string
): { from: string; to: string } {
  const today = new Date();
  const toStr = toLocalDateStr;

  switch (preset) {
    case "last7": {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      return { from: toStr(from), to: toStr(today) };
    }
    case "thisMonth": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toStr(from), to: toStr(today) };
    }
    case "lastMonth": {
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const to = new Date(today.getFullYear(), today.getMonth(), 0); // last day of prev month
      return { from: toStr(from), to: toStr(to) };
    }
    case "allTime": {
      return { from: createdAt.slice(0, 10), to: toStr(today) };
    }
    default:
      return { from: toStr(today), to: toStr(today) };
  }
}

export default function AnalyticsDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const analytics = id ? getDummyQrAnalytics(id) : null;

  const { min: rangeMin, max: rangeMax } = useMemo(
    () => (analytics ? getDateRangeFromScans(analytics.scansByDay) : { min: "", max: "" }),
    [analytics]
  );

  const createdAt = analytics?.createdAt ?? "";

  // Default to last 7 days
  const defaultRange = useMemo(
    () => getPresetRange("last7", createdAt),
    [createdAt]
  );

  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [activePreset, setActivePreset] = useState<Preset>("last7");

  const handlePresetChange = useCallback(
    (preset: Preset) => {
      setActivePreset(preset);
      const range = getPresetRange(preset, createdAt);
      setDateFrom(range.from);
      setDateTo(range.to);
    },
    [createdAt]
  );

  /** Build a full day-by-day series for the selected range, filling gaps with 0. */
  const filteredScansByDay = useMemo(() => {
    const from = dateFrom || rangeMin;
    const to = dateTo || rangeMax;
    if (!from || !to) return analytics?.scansByDay ?? [];

    // Build a lookup from existing data
    const lookup = new Map<string, number>();
    for (const d of analytics?.scansByDay ?? []) {
      lookup.set(d.date, d.scans);
    }

    // Generate every date in the selected range
    const result: ScanByDay[] = [];
    const cursor = new Date(from + "T12:00:00");
    const end = new Date(to + "T12:00:00");
    while (cursor <= end) {
      const key = toLocalDateStr(cursor);
      result.push({ date: key, scans: lookup.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [analytics?.scansByDay, dateFrom, dateTo, rangeMin, rangeMax]);

  const rangeLabel = useMemo(() => {
    if (filteredScansByDay.length === 0) return "No data in range";
    const first = filteredScansByDay[0]!.date;
    const last = filteredScansByDay[filteredScansByDay.length - 1]!.date;
    return `${formatChartDate(first)} – ${formatChartDate(last)}`;
  }, [filteredScansByDay]);


  if (!id || !analytics) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                QR code not found.
              </p>
              <Link
                href="/dashboard/analytics"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400"
              >
                <ArrowLeft className="size-4" />
                Back to analytics
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Demo data warning */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-200/90">
              <span className="font-medium text-amber-400">Heads up!</span>{" "}
              The data shown here is for demonstration purposes only and does not
              reflect your actual analytics. We&apos;re actively working on
              bringing real-time data to this page.
            </p>
          </div>

          {/* Back link */}
          <Link
            href="/dashboard/analytics"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to analytics
          </Link>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <QrCode className="size-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {analytics.title}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatQrType(analytics.type)} · Usage analytics
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Total scans"
              value={analytics.totalScans}
              icon={Scan}
            />
            <StatCard
              label="Last 7 days"
              value={analytics.scansByDay.slice(-7).reduce((s, d) => s + d.scans, 0)}
              icon={BarChart3}
            />
            <StatCard
              label="Last scanned"
              value={
                analytics.lastScannedAt
                  ? formatShortDate(analytics.lastScannedAt)
                  : "Never"
              }
              icon={Calendar}
              valueClassName="text-sm"
            />
          </div>

          {/* Scans by day */}
          <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Scans by day
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {rangeLabel}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <DateRangePicker
                  value={{ from: dateFrom, to: dateTo }}
                  onChange={({ from, to }) => {
                    setDateFrom(from);
                    setDateTo(to);
                    setActivePreset("custom");
                  }}
                  minDate={analytics.createdAt.slice(0, 10)}
                  maxDate={toLocalDateStr(new Date())}
                  placeholder="Pick a date range"
                  align="end"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
                    >
                      <CalendarRange className="size-3.5" />
                      {PRESET_LABELS[activePreset]}
                      <ChevronDown className="size-3.5 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {(Object.keys(PRESET_LABELS) as Preset[])
                      .filter((k) => k !== "custom")
                      .map((key) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handlePresetChange(key)}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          {PRESET_LABELS[key]}
                          {activePreset === key && (
                            <Check className="size-3.5 text-emerald-500" />
                          )}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              {filteredScansByDay.length === 0 ? (
                <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center">
                  <CalendarRange className="size-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No data in selected range
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose a different From / To date or reset range.
                  </p>
                </div>
              ) : (
                <ScansByDayChart scansByDay={filteredScansByDay} />
              )}
            </div>
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
  valueClassName,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm ring-1 ring-border/50">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          "mt-2 text-lg font-semibold tracking-tight text-foreground",
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
}

const CHART_COLORS = {
  bar: "hsl(160 84% 39%)", // emerald-500
  barHover: "hsl(160 84% 45%)",
  grid: "hsl(0 0% 50% / 0.2)",
  axis: "hsl(0 0% 65%)",
} as const;

function ScansByDayChart({ scansByDay }: { scansByDay: ScanByDay[] }) {
  const chartData = scansByDay.map((d) => ({
    date: d.date,
    label: formatChartDate(d.date),
    scans: d.scans,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
          />
          <YAxis
            dataKey="scans"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as { label: string; scans: number };
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {d.scans} {d.scans === 1 ? "scan" : "scans"}
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
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "—";
  }
}

function formatChartDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
