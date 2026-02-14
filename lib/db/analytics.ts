"use server";

import type { ClientSession } from "mongodb";
import { headers } from "next/headers";
import { getDb } from "@/lib/db/mongodb";
import { SCAN_EVENTS_COLLECTION, type ScanEventDocument } from "@/lib/db/schemas/analytics";
import { incrementQRScanCount } from "@/lib/db/qrs";
import { parseDeviceType, parseBrowserName, parseOsName } from "@/lib/qr/user-agent";

// ── Geo resolution ──────────────────────────────────────────────────────────

type GeoResult = {
  countryCode?: string;
  city?: string;
  region?: string;
};

/**
 * Resolves geo data from request headers.
 * Priority: Cloudflare headers → Vercel headers → IP geolocation API fallback.
 * Never throws — returns partial/empty result on failure.
 */
async function resolveGeo(hdrs: Headers): Promise<GeoResult> {
  // 1. Cloudflare headers
  const cfCountry = hdrs.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    return {
      countryCode: cfCountry,
      city: hdrs.get("cf-ipcity") ?? undefined,
      region: hdrs.get("cf-ipregion") ?? undefined,
    };
  }

  // 2. Vercel headers
  const vercelCountry = hdrs.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry !== "XX") {
    return {
      countryCode: vercelCountry,
      city: hdrs.get("x-vercel-ip-city") ?? undefined,
      region: hdrs.get("x-vercel-ip-country-region") ?? undefined,
    };
  }

  // 3. IP geolocation fallback (ipapi.co — free 1k req/day, HTTPS, commercial OK)
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    undefined;

  // Skip private/localhost IPs — geo lookup won't work for these
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return {};
  }

  try {
    const res = await fetch(
      `https://ipapi.co/${ip}/json/`,
      { signal: AbortSignal.timeout(2000) } // 2s timeout — don't slow down the scan
    );
    if (!res.ok) return {};
    const data = (await res.json()) as {
      error?: boolean;
      country_code?: string;
      city?: string;
      region?: string;
    };
    if (data.error) return {};
    return {
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
    };
  } catch {
    // Network error or timeout — don't block the scan
    return {};
  }
}

// ── Indexes ─────────────────────────────────────────────────────────────────

/** Module-level flag — indexes only need to be ensured once per process lifetime. */
let _indexesEnsured = false;

/**
 * Ensures indexes on the scan_events collection. Idempotent and cached — after
 * the first successful call the flag is set and subsequent calls are a no-op.
 *
 * Index strategy:
 * - Primary: { qrId, scannedAt } — covers date-range queries, "last scan", deletes, and is the
 *   prefix for all aggregation $match stages (qrId + scannedAt range).
 * - Per-field compounds: { qrId, scannedAt, <field> } — lets MongoDB satisfy the $match on
 *   qrId + scannedAt range AND the $group key in a single index scan for each breakdown query.
 */
async function ensureScanEventIndexes(): Promise<void> {
  if (_indexesEnsured) return;
  const db = await getDb();
  const coll = db.collection(SCAN_EVENTS_COLLECTION);
  await Promise.all([
    coll.createIndex({ qrId: 1, scannedAt: -1 }),                    // date-range, last scan, deletes
    coll.createIndex({ qrId: 1, scannedAt: -1, deviceType: 1 }),     // device breakdown
    coll.createIndex({ qrId: 1, scannedAt: -1, countryCode: 1 }),    // country breakdown
    coll.createIndex({ qrId: 1, scannedAt: -1, referrer: 1 }),       // referrer breakdown
    coll.createIndex({ qrId: 1, scannedAt: -1, utmSource: 1 }),      // UTM source breakdown
  ]);
  _indexesEnsured = true;
}

// ── Record scan ─────────────────────────────────────────────────────────────

/** Optional UTM parameters extracted from the scan URL's query string. */
export type UtmParams = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};

/**
 * Records one scan event and increments the QR's scanCount.
 *
 * Internally reads request headers to extract device type, browser, OS,
 * country code (Cloudflare / Vercel), and referrer — the caller only needs
 * to pass the qrId and optional UTM params (only available via searchParams).
 */
export async function recordScan(qrId: string, utm?: UtmParams): Promise<void> {
  // Ensure indexes (no-op after first call in this process)
  await ensureScanEventIndexes();

  // ── Collect analytics from request headers ──────────────────────────
  const hdrs = await headers();
  const ua = hdrs.get("user-agent") ?? "";
  const referrer = hdrs.get("referer") ?? undefined;

  const deviceType = parseDeviceType(ua);
  const browserName = parseBrowserName(ua);
  const osName = parseOsName(ua);

  // ── Geo: prefer CDN headers, fall back to IP geolocation ────────────
  const geo = await resolveGeo(hdrs);

  // ── Build document ──────────────────────────────────────────────────
  const db = await getDb();
  const coll = db.collection<ScanEventDocument>(SCAN_EVENTS_COLLECTION);
  const now = new Date();

  const doc: Omit<ScanEventDocument, "_id"> = {
    qrId,
    scannedAt: now,
    deviceType,
    ...(browserName && { browserName }),
    ...(osName && { osName }),
    ...(geo.countryCode && { countryCode: geo.countryCode }),
    ...(geo.city && { city: geo.city }),
    ...(geo.region && { region: geo.region }),
    ...(referrer && { referrer }),
    ...(utm?.utmSource && { utmSource: utm.utmSource }),
    ...(utm?.utmMedium && { utmMedium: utm.utmMedium }),
    ...(utm?.utmCampaign && { utmCampaign: utm.utmCampaign }),
    ...(utm?.utmContent && { utmContent: utm.utmContent }),
  };

  // Insert event + increment counter in parallel — independent operations
  await Promise.all([
    coll.insertOne(doc),
    incrementQRScanCount(qrId),
  ]);
}

export type ScanByDay = { date: string; scans: number };
export type ScansByDevice = { device: string; scans: number };
export type ScansByCountry = { country: string; scans: number };
export type ScansByReferrer = { referrer: string; scans: number };
export type ScansByUtmSource = { source: string; scans: number };

export type ScanAnalyticsResult = {
  lastScannedAt: string | null;
  scansByDay: ScanByDay[];
  scansByDevice: ScansByDevice[];
  scansByCountry: ScansByCountry[];
  scansByReferrer: ScansByReferrer[];
  scansByUtmSource: ScansByUtmSource[];
};

/**
 * Deletes all scan events for a QR. Call when deleting a QR so analytics are removed cascadically.
 * Pass session for transactional delete (both QR and scan events in one transaction).
 */
export async function deleteScanEventsByQrId(
  qrId: string,
  session?: ClientSession
): Promise<number> {
  const db = await getDb();
  const coll = db.collection<ScanEventDocument>(SCAN_EVENTS_COLLECTION);
  const result = await coll.deleteMany({ qrId }, session ? { session } : undefined);
  return result.deletedCount ?? 0;
}

/**
 * Returns aggregated scan analytics for a QR in a single MongoDB round-trip using $facet.
 *
 * One `$match` filters to the QR's date range, then `$facet` fans out into
 * 5 sub-pipelines (byDay, byDevice, byCountry, byReferrer, byUtmSource)
 * that all execute within the same aggregation cursor — eliminating the
 * previous 6-query overhead.
 *
 * `lastScannedAt` is extracted from the byDay result (last date bucket) to
 * avoid an extra `findOne` round-trip.
 */
export async function getScanAnalytics(
  qrId: string,
  createdAt: Date
): Promise<ScanAnalyticsResult> {
  const db = await getDb();
  const coll = db.collection<ScanEventDocument>(SCAN_EVENTS_COLLECTION);

  const startOfCreated = new Date(createdAt);
  startOfCreated.setUTCHours(0, 0, 0, 0);
  const now = new Date();

  type FacetResult = {
    lastScan: Array<{ scannedAt: Date }>;
    byDay: ScanByDay[];
    byDevice: ScansByDevice[];
    byCountry: ScansByCountry[];
    byReferrer: ScansByReferrer[];
    byUtmSource: ScansByUtmSource[];
  };

  const [result] = await coll
    .aggregate<FacetResult>([
      {
        $match: {
          qrId,
          scannedAt: { $gte: startOfCreated, $lte: now },
        },
      },
      {
        $facet: {
          // ── Last scan timestamp ───────────────────────────────────
          lastScan: [
            { $sort: { scannedAt: -1 as const } },
            { $limit: 1 },
            { $project: { scannedAt: 1, _id: 0 } },
          ],

          // ── Scans by day ──────────────────────────────────────────
          byDay: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$scannedAt" } },
                scans: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 as const } },
            { $project: { date: "$_id", scans: 1, _id: 0 } },
          ],

          // ── Scans by device type ──────────────────────────────────
          byDevice: [
            { $match: { deviceType: { $exists: true } } },
            { $group: { _id: "$deviceType", scans: { $sum: 1 } } },
            { $sort: { scans: -1 as const } },
            { $project: { device: "$_id", scans: 1, _id: 0 } },
          ],

          // ── Scans by country (top 20) ─────────────────────────────
          byCountry: [
            { $match: { countryCode: { $exists: true } } },
            { $group: { _id: "$countryCode", scans: { $sum: 1 } } },
            { $sort: { scans: -1 as const } },
            { $limit: 20 },
            { $project: { country: "$_id", scans: 1, _id: 0 } },
          ],

          // ── Top referrers (top 10) ────────────────────────────────
          byReferrer: [
            { $match: { referrer: { $exists: true, $ne: "" } } },
            { $group: { _id: "$referrer", scans: { $sum: 1 } } },
            { $sort: { scans: -1 as const } },
            { $limit: 10 },
            { $project: { referrer: "$_id", scans: 1, _id: 0 } },
          ],

          // ── UTM sources (top 10) ──────────────────────────────────
          byUtmSource: [
            { $match: { utmSource: { $exists: true, $ne: "" } } },
            { $group: { _id: "$utmSource", scans: { $sum: 1 } } },
            { $sort: { scans: -1 as const } },
            { $limit: 10 },
            { $project: { source: "$_id", scans: 1, _id: 0 } },
          ],
        },
      },
    ])
    .toArray();

  const lastScan = result?.lastScan?.[0];

  return {
    lastScannedAt: lastScan?.scannedAt
      ? lastScan.scannedAt.toISOString()
      : null,
    scansByDay: result?.byDay ?? [],
    scansByDevice: result?.byDevice ?? [],
    scansByCountry: result?.byCountry ?? [],
    scansByReferrer: result?.byReferrer ?? [],
    scansByUtmSource: result?.byUtmSource ?? [],
  };
}
