import { z } from "zod";

/**
 * Scan events collection: one document per QR scan.
 * Minimal schema for brute-force v1; optional fields (country, device, etc.) can be added later.
 */

export const SCAN_EVENTS_COLLECTION = "scan_events" as const;

/** Document as stored in DB. _id is ObjectId by default; qrId + scannedAt are required. */
export const scanEventDocumentSchema = z.object({
  _id: z.unknown().optional(), // MongoDB ObjectId when present
  qrId: z.string().min(1).max(64),
  scannedAt: z.coerce.date(),
});

export type ScanEventDocument = z.infer<typeof scanEventDocumentSchema>;
