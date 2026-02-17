"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CalendarRange,
  Check,
  ChevronDown,
  Globe,
  Link2,
  Megaphone,
  Monitor,
  QrCode,
  ScanLine,
} from "lucide-react";
import { DeviceChart } from "@/components/dashboard/analytics/DeviceChart";
import { CountryChart } from "@/components/dashboard/analytics/CountryChart";
import { ReferrerList } from "@/components/dashboard/analytics/ReferrerList";
import { UtmSourceChart } from "@/components/dashboard/analytics/UtmSourceChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { qrsApi, type ScanByDay } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

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
  createdAt: string,
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
      const to = new Date(today.getFullYear(), today.getMonth(), 0);
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
  // const [data, setData] = useState<Awaited<
  //   ReturnType<typeof qrsApi.getAnalytics>
  // > | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!id) {
  //     setLoading(false);
  //     setError("Invalid QR id");
  //     return;
  //   }
  //   let cancelled = false;
  //   setLoading(true);
  //   setError(null);
  //   qrsApi
  //     .getAnalytics(id)
  //     .then((res) => {
  //       if (!cancelled) setData(res);
  //     })
  //     .catch((err) => {
  //       if (!cancelled) {
  //         setData(null);
  //         setError(
  //           err?.response?.status === 404
  //             ? "QR code not found."
  //             : err?.response?.data?.error ?? "Failed to load analytics."
  //         );
  //       }
  //     })
  //     .finally(() => {
  //       if (!cancelled) setLoading(false);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [id]);
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["qrs", "analytics", id],
    queryFn: () => qrsApi.getAnalytics(id),
    enabled: !!id,
  });

  const createdAt = data?.qr.createdAt ?? "";
  const { min: rangeMin, max: rangeMax } = useMemo(
    () =>
      data ? getDateRangeFromScans(data.scansByDay) : { min: "", max: "" },
    [data],
  );

  const defaultRange = useMemo(
    () => getPresetRange("last7", createdAt),
    [createdAt],
  );

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activePreset, setActivePreset] = useState<Preset>("last7");
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize date range once when data and defaultRange are both ready.
    // Use a ref to ensure this only runs once, avoiding complex dependency issues.
    if (
      !initializedRef.current &&
      data &&
      defaultRange.from &&
      defaultRange.to
    ) {
      setDateFrom(defaultRange.from);
      setDateTo(defaultRange.to);
      initializedRef.current = true;
    }
  }, [data, defaultRange]);

  const handlePresetChange = useCallback(
    (preset: Preset) => {
      setActivePreset(preset);
      const range = getPresetRange(preset, createdAt);
      setDateFrom(range.from);
      setDateTo(range.to);
    },
    [createdAt],
  );

  const filteredScansByDay = useMemo(() => {
    const from =
      dateFrom || rangeMin || (data?.qr?.createdAt?.slice(0, 10) ?? "");
    const to = dateTo || rangeMax || toLocalDateStr(new Date());
    if (!from || !to || !data) return data?.scansByDay ?? [];

    const lookup = new Map<string, number>();
    for (const d of data.scansByDay) {
      lookup.set(d.date, d.scans);
    }

    const result: ScanByDay[] = [];
    const cursor = new Date(from + "T12:00:00");
    const end = new Date(to + "T12:00:00");
    while (cursor <= end) {
      const key = toLocalDateStr(cursor);
      result.push({ date: key, scans: lookup.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [data, dateFrom, dateTo, rangeMin, rangeMax]);

  const rangeLabel = useMemo(() => {
    if (filteredScansByDay.length === 0) return "No data in range";
    const first = filteredScansByDay[0]!.date;
    const last = filteredScansByDay[filteredScansByDay.length - 1]!.date;
    return `${formatChartDate(first)} – ${formatChartDate(last)}`;
  }, [filteredScansByDay]);

  if (!id) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-sm text-muted-foreground">Invalid QR code.</p>
            <Link
              href="/dashboard/analytics"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400"
            >
              <ArrowLeft className="size-4" />
              Back to analytics
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/dashboard/analytics"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to analytics
            </Link>
            <div className="mb-8 flex items-center gap-3">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-[280px] rounded-xl" />
              <Skeleton className="h-[280px] rounded-xl" />
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Skeleton className="h-[280px] rounded-xl" />
              <Skeleton className="h-[280px] rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "QR code not found."}
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

  const {
    qr,
    lastScannedAt,
    scansByDay,
    scansByDevice = [],
    scansByCountry = [],
    scansByReferrer = [],
    scansByUtmSource = [],
  } = data;
  const totalScans = qr.scanCount ?? 0;
  const last7Scans = scansByDay.slice(-7).reduce((s, d) => s + d.scans, 0);
  const uniqueCountries = scansByCountry.length;

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/analytics"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to analytics
          </Link>

          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <QrCode className="size-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {qr.name || "Unnamed QR"}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatContentType(qr.contentType)} · Usage analytics
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total scans" value={totalScans} icon={ScanLine} />
            <StatCard label="Last 7 days" value={last7Scans} icon={BarChart3} />
            <StatCard label="Countries" value={uniqueCountries} icon={Globe} />
            <StatCard
              label="Last scanned"
              value={lastScannedAt ? formatShortDate(lastScannedAt) : "Never"}
              icon={Calendar}
              valueClassName="text-sm"
            />
          </div>

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
                  minDate={qr.createdAt.slice(0, 10)}
                  maxDate={toLocalDateStr(new Date())}
                  placeholder="Pick a date range"
                  align="end"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/25"
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

          {/* ── Device & Country breakdown ────────────────────────────── */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Device type */}
            <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
              <div className="border-b border-border px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Scans by device
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mobile, desktop &amp; tablet breakdown
                </p>
              </div>
              <div className="min-h-[220px] p-6 sm:p-8">
                <DeviceChart data={scansByDevice} />
              </div>
            </div>

            {/* Country */}
            <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
              <div className="border-b border-border px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Scans by country
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Top 20 countries by scan volume
                </p>
              </div>
              <div className="min-h-[220px] p-6 sm:p-8">
                <CountryChart data={scansByCountry} />
              </div>
            </div>
          </div>

          {/* ── Referrer & UTM breakdown ──────────────────────────────── */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Referrers */}
            <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
              <div className="border-b border-border px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Top referrers
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Where your scans are coming from
                </p>
              </div>
              <div className="min-h-[220px] p-6 sm:p-8">
                <ReferrerList data={scansByReferrer} />
              </div>
            </div>

            {/* UTM Sources */}
            <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
              <div className="border-b border-border px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    UTM sources
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Campaign source tracking
                </p>
              </div>
              <div className="min-h-[220px] p-6 sm:p-8">
                <UtmSourceChart data={scansByUtmSource} />
              </div>
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
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

const CHART_COLORS = {
  bar: "hsl(160 84% 39%)",
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
