import { z } from "zod";

/**
 * Scan events collection: one document per QR scan.
 * Stores device, geo, UTM & referrer data for analytics dashboards.
 */

export const SCAN_EVENTS_COLLECTION = "scan_events" as const;

export const deviceTypeSchema = z.enum(["mobile", "tablet", "desktop"]);
export type DeviceType = z.infer<typeof deviceTypeSchema>;

/** Document as stored in DB. _id is ObjectId by default; qrId + scannedAt are required. */
export const scanEventDocumentSchema = z.object({
  _id: z.unknown().optional(), // MongoDB ObjectId when present
  qrId: z.string().min(1).max(64),
  scannedAt: z.coerce.date(),

  // ── Device ────────────────────────────────────────────────────────────
  deviceType: deviceTypeSchema.optional(),
  browserName: z.string().max(64).optional(),
  osName: z.string().max(64).optional(),

  // ── Geo ───────────────────────────────────────────────────────────────
  /** ISO 3166-1 alpha-2, e.g. "US", "IN". */
  countryCode: z.string().max(2).optional(),
  /** City name, e.g. "Mumbai", "New York". */
  city: z.string().max(128).optional(),
  /** Region / state, e.g. "Maharashtra", "California". */
  region: z.string().max(128).optional(),

  // ── Traffic source ────────────────────────────────────────────────────
  referrer: z.string().max(2048).optional(),
  utmSource: z.string().max(256).optional(),
  utmMedium: z.string().max(256).optional(),
  utmCampaign: z.string().max(256).optional(),
  utmContent: z.string().max(256).optional(),
});

export type ScanEventDocument = z.infer<typeof scanEventDocumentSchema>;
