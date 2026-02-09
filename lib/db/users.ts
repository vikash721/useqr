import type { User as ClerkUser } from "@clerk/backend";
import { getDb } from "@/lib/db/mongodb";
import {
  USERS_COLLECTION,
  type UserDocument,
  type UserUpsertInput,
  type PlanSlug,
} from "@/lib/db/schemas/user";

const DEFAULT_PLAN: PlanSlug = "free";

/**
 * Map Clerk User to our UserDocument shape. Single place for Clerk → DB mapping.
 */
function clerkUserToDocument(clerk: ClerkUser): UserUpsertInput {
  const primary = clerk.primaryEmailAddress ?? clerk.emailAddresses?.[0];
  const email = primary?.emailAddress ?? null;
  const emailVerified = primary?.verification?.status === "verified" || false;
  const firstName = clerk.firstName ?? null;
  const lastName = clerk.lastName ?? null;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || null;
  const now = new Date();
  const lastSignInAt = clerk.lastSignInAt != null ? new Date(clerk.lastSignInAt) : null;

  return {
    clerkId: clerk.id,
    email,
    emailVerified,
    firstName,
    lastName,
    name,
    imageUrl: clerk.imageUrl ?? null,
    createdAt: now,
    updatedAt: now,
    lastSignInAt,
    plan: DEFAULT_PLAN,
  };
}

/**
 * Ensure unique indexes on users collection. Idempotent; safe to call on every deploy.
 */
export async function ensureUserIndexes(): Promise<void> {
  const db = await getDb();
  const coll = db.collection(USERS_COLLECTION);
  await coll.createIndex({ clerkId: 1 }, { unique: true });
  await coll.createIndex(
    { email: 1 },
    { unique: true, sparse: true }
  );
}

export type UpsertUserResult = { user: UserDocument; created: boolean };

/**
 * Upsert user from Clerk into our DB. Creates on first sync, updates on subsequent syncs.
 * Preserves existing createdAt; updates updatedAt and profile fields from Clerk.
 * Returns { user, created: true } on insert, { user, created: false } on update.
 */
export async function upsertUserFromClerk(clerkUser: ClerkUser): Promise<UpsertUserResult> {
  await ensureUserIndexes();
  const db = await getDb();
  const coll = db.collection<UserDocument>(USERS_COLLECTION);
  const doc = clerkUserToDocument(clerkUser);

  const existing = await coll.findOne({ clerkId: clerkUser.id });
  const now = new Date();

  if (existing) {
    const update: Partial<UserDocument> = {
      email: doc.email,
      emailVerified: doc.emailVerified,
      firstName: doc.firstName,
      lastName: doc.lastName,
      name: doc.name,
      imageUrl: doc.imageUrl,
      updatedAt: now,
      lastSignInAt: doc.lastSignInAt ?? existing.lastSignInAt,
    };
    await coll.updateOne(
      { clerkId: clerkUser.id },
      { $set: update }
    );
    const updated = await coll.findOne({ clerkId: clerkUser.id });
    if (!updated) throw new Error("User update failed");
    return { user: updated as UserDocument, created: false };
  }

  const insert: UserDocument = {
    ...doc,
    createdAt: now,
    updatedAt: now,
  };
  await coll.insertOne(insert as UserDocument);
  const inserted = await coll.findOne({ clerkId: clerkUser.id });
  if (!inserted) throw new Error("User insert failed");
  return { user: inserted as UserDocument, created: true };
}

/**
 * Get user by Clerk id. Returns null if not found.
 */
export async function getUserByClerkId(clerkId: string): Promise<UserDocument | null> {
  const db = await getDb();
  const coll = db.collection<UserDocument>(USERS_COLLECTION);
  const doc = await coll.findOne({ clerkId });
  return doc as UserDocument | null;
}

/**
 * Get all users, newest first. For waitlist/admin list; use only in authenticated APIs.
 */
export async function getAllUsers(): Promise<UserDocument[]> {
  const db = await getDb();
  const coll = db.collection<UserDocument>(USERS_COLLECTION);
  const cursor = coll.find({}).sort({ createdAt: -1 });
  const list = await cursor.toArray();
  return list as UserDocument[];
}

/**
 * Delete user by Clerk id (e.g. from Clerk webhook on user.deleted). Returns true if a document was deleted.
 */
export async function deleteUserByClerkId(clerkId: string): Promise<boolean> {
  const db = await getDb();
  const coll = db.collection<UserDocument>(USERS_COLLECTION);
  const result = await coll.deleteOne({ clerkId });
  return (result.deletedCount ?? 0) > 0;
}
