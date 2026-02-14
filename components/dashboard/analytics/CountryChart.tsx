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
import { Globe } from "lucide-react";
import type { ScansByCountry } from "@/lib/api";

/** ISO 3166-1 alpha-2 → display name (common subset; falls back to code). */
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  IN: "India",
  DE: "Germany",
  FR: "France",
  CA: "Canada",
  AU: "Australia",
  BR: "Brazil",
  JP: "Japan",
  CN: "China",
  KR: "South Korea",
  IT: "Italy",
  ES: "Spain",
  MX: "Mexico",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  SG: "Singapore",
  AE: "UAE",
  SA: "Saudi Arabia",
  PK: "Pakistan",
  BD: "Bangladesh",
  ID: "Indonesia",
  NG: "Nigeria",
  ZA: "South Africa",
  PH: "Philippines",
  TH: "Thailand",
  VN: "Vietnam",
  MY: "Malaysia",
  TR: "Turkey",
  PL: "Poland",
  RU: "Russia",
  UA: "Ukraine",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  EG: "Egypt",
  KE: "Kenya",
  GH: "Ghana",
  NZ: "New Zealand",
  IE: "Ireland",
  PT: "Portugal",
  CH: "Switzerland",
  AT: "Austria",
  BE: "Belgium",
  CZ: "Czechia",
  RO: "Romania",
  HU: "Hungary",
  IL: "Israel",
  HK: "Hong Kong",
  TW: "Taiwan",
  LK: "Sri Lanka",
  NP: "Nepal",
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

const CHART_COLORS = {
  bar: "hsl(160 84% 39%)",
  grid: "hsl(0 0% 50% / 0.2)",
  axis: "hsl(0 0% 65%)",
} as const;

export function CountryChart({ data }: { data: ScansByCountry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Globe className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          No location data yet
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Country breakdown will appear after scans are recorded.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    country: d.country,
    name: countryName(d.country),
    scans: d.scans,
  }));

  const total = data.reduce((s, d) => s + d.scans, 0);

  // For small datasets use a horizontal bar; for larger use trimmed names
  const barHeight = Math.max(chartData.length * 36, 200);

  return (
    <div className="h-full w-full">
      <div style={{ height: barHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]!.payload as {
                  country: string;
                  name: string;
                  scans: number;
                };
                const pct = total > 0 ? ((d.scans / total) * 100).toFixed(1) : "0";
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">
                      {d.name} ({d.country})
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
              cursor={{ fill: "hsl(0 0% 100% / 0.05)" }}
            />
            <Bar
              dataKey="scans"
              fill={CHART_COLORS.bar}
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
