import type { ClientSession } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import { SCAN_EVENTS_COLLECTION, type ScanEventDocument } from "@/lib/db/schemas/analytics";
import { incrementQRScanCount } from "@/lib/db/qrs";

/**
 * Ensures indexes on the scan_events collection. Idempotent; safe to call on every deploy or first write.
 * Compound index supports "scans for QR X" and "scans in date range" for future analytics UI.
 */
export async function ensureScanEventIndexes(): Promise<void> {
  const db = await getDb();
  const coll = db.collection(SCAN_EVENTS_COLLECTION);
  await coll.createIndex({ qrId: 1, scannedAt: -1 });
}

/**
 * Records one scan event and increments the QR's scanCount. Call when a user visits the scan page and analytics is enabled.
 */
export async function recordScan(qrId: string): Promise<void> {
  await ensureScanEventIndexes();
  const db = await getDb();
  const coll = db.collection<ScanEventDocument>(SCAN_EVENTS_COLLECTION);
  const now = new Date();
  await coll.insertOne({ qrId, scannedAt: now });
  await incrementQRScanCount(qrId);
}

export type ScanByDay = { date: string; scans: number };

export type ScanAnalyticsResult = {
  lastScannedAt: string | null;
  scansByDay: ScanByDay[];
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
 * Returns aggregated scan analytics for a QR: last scan time and scans grouped by day (from QR creation to now).
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

  const [lastEvent, byDay] = await Promise.all([
    coll.findOne(
      { qrId },
      { projection: { scannedAt: 1 }, sort: { scannedAt: -1 } }
    ) as Promise<{ scannedAt?: Date } | null>,
    coll
      .aggregate<{ date: string; scans: number }>([
        {
          $match: {
            qrId,
            scannedAt: { $gte: startOfCreated, $lte: now },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$scannedAt" } },
            scans: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", scans: 1, _id: 0 } },
      ])
      .toArray(),
  ]);

  return {
    lastScannedAt: lastEvent?.scannedAt
      ? lastEvent.scannedAt.toISOString()
      : null,
    scansByDay: byDay,
  };
}
