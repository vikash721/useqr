import { getDb } from "@/lib/db/mongodb";
import {
  QRS_COLLECTION,
  type QRDocument,
  type QRCreateBody,
  type QRUpdateBody,
} from "@/lib/db/schemas/qr";

/**
 * Ensures indexes on the qrs collection. Idempotent; safe to call on every deploy.
 * Only required indexes: list by owner + created (for dashboard).
 */
export async function ensureQRIndexes(): Promise<void> {
  const db = await getDb();
  const coll = db.collection(QRS_COLLECTION);
  await coll.createIndex({ clerkId: 1, createdAt: -1 });
}

export type CreateQRInput = QRCreateBody & {
  _id: string;
  clerkId: string;
  payload: string;
};

/**
 * Inserts a new QR document. Call ensureQRIndexes once at app startup or first use.
 */
export async function createQR(input: CreateQRInput): Promise<QRDocument> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const now = new Date();
  const doc: QRDocument = {
    _id: input._id,
    clerkId: input.clerkId,
    name: input.name ?? "",
    contentType: input.contentType,
    content: input.content,
    payload: input.payload,
    template: input.template ?? "classic",
    analyticsEnabled: input.analyticsEnabled ?? true,
    status: input.status ?? "active",
    scanCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  await coll.insertOne(doc);
  return doc;
}

/**
 * Gets a QR by _id and clerkId. Returns null if not found or not owned.
 * Use for authenticated read/update/delete.
 */
export async function getQRByIdAndClerk(
  id: string,
  clerkId: string
): Promise<QRDocument | null> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const doc = await coll.findOne({ _id: id, clerkId });
  return doc as QRDocument | null;
}

/**
 * Gets a QR by _id only (for public card page). Returns null if not found.
 */
export async function getQRById(id: string): Promise<QRDocument | null> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const doc = await coll.findOne({ _id: id });
  return doc as QRDocument | null;
}

/**
 * Increments scanCount for a QR by _id (used when recording a scan). No clerkId check.
 */
export async function incrementQRScanCount(id: string): Promise<void> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const now = new Date();
  await coll.updateOne(
    { _id: id },
    { $inc: { scanCount: 1 }, $set: { updatedAt: now } }
  );
}

export type ListQROptions = {
  limit?: number;
  skip?: number;
};

/**
 * Lists QRs for a user, newest first. Uses index { clerkId: 1, createdAt: -1 }.
 */
export async function listQRsByClerk(
  clerkId: string,
  options: ListQROptions = {}
): Promise<QRDocument[]> {
  const { limit = 50, skip = 0 } = options;
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const cursor = coll
    .find({ clerkId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(limit, 100));
  const list = await cursor.toArray();
  return list as QRDocument[];
}

/**
 * Counts QRs for a user (for dashboard stats). Uses same index.
 */
export async function countQRsByClerk(clerkId: string): Promise<number> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  return coll.countDocuments({ clerkId });
}

/** Allowed fields when updating a QR (payload is server-computed only). */
export type QRUpdateInput = QRUpdateBody & { payload?: string };

/**
 * Updates a QR. Only updates if _id + clerkId match. Returns the updated doc or null.
 * Pass payload when contentType or content changed (server recomputes).
 */
export async function updateQR(
  id: string,
  clerkId: string,
  update: QRUpdateInput
): Promise<QRDocument | null> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const now = new Date();
  const $set: Partial<QRDocument> = { ...update, updatedAt: now };
  const result = await coll.findOneAndUpdate(
    { _id: id, clerkId },
    { $set },
    { returnDocument: "after" }
  );
  return result as QRDocument | null;
}

/**
 * Deletes a QR. Only deletes if _id + clerkId match. Returns true if deleted.
 */
export async function deleteQR(id: string, clerkId: string): Promise<boolean> {
  const db = await getDb();
  const coll = db.collection<QRDocument>(QRS_COLLECTION);
  const result = await coll.deleteOne({ _id: id, clerkId });
  return (result.deletedCount ?? 0) > 0;
}
