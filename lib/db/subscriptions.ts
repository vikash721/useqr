import { getDb } from "@/lib/db/mongodb";
import type { PlanSlug } from "@/lib/db/schemas/user";
import {
  SUBSCRIPTIONS_COLLECTION,
  type SubscriptionDocument,
  type SubscriptionStatus,
} from "@/lib/db/schemas/subscription";

export async function ensureSubscriptionIndexes(): Promise<void> {
  const db = await getDb();
  const coll = db.collection(SUBSCRIPTIONS_COLLECTION);
  await coll.createIndex({ clerkId: 1, updatedAt: -1 });
  await coll.createIndex({ subscriptionId: 1 }, { unique: true });
}

/**
 * Upsert subscription for a user. Called from Paddle webhooks.
 * Uses subscriptionId as the canonical key; clerkId is the user link.
 */
export async function upsertSubscription(doc: {
  clerkId: string;
  subscriptionId: string;
  paddleCustomerId?: string;
  status: SubscriptionStatus;
  priceId?: string;
  plan: PlanSlug;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  scheduledChangeEffectiveAt: string | null;
}): Promise<SubscriptionDocument> {
  await ensureSubscriptionIndexes();
  const db = await getDb();
  const coll = db.collection<SubscriptionDocument>(SUBSCRIPTIONS_COLLECTION);
  const now = new Date();
  await coll.updateOne(
    { subscriptionId: doc.subscriptionId },
    {
      $set: {
        ...doc,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
  const out = await coll.findOne({ subscriptionId: doc.subscriptionId });
  if (!out) throw new Error("Subscription upsert failed");
  return out;
}

/** Get current subscription by Clerk id (most recent by updatedAt). */
export async function getSubscriptionByClerkId(
  clerkId: string
): Promise<SubscriptionDocument | null> {
  const db = await getDb();
  const coll = db.collection<SubscriptionDocument>(SUBSCRIPTIONS_COLLECTION);
  const doc = await coll.findOne({ clerkId }, { sort: { updatedAt: -1 } });
  return doc;
}

/** Get subscription by Paddle subscription id (for webhook lookups). */
export async function getSubscriptionBySubscriptionId(
  subscriptionId: string
): Promise<SubscriptionDocument | null> {
  const db = await getDb();
  const coll = db.collection<SubscriptionDocument>(SUBSCRIPTIONS_COLLECTION);
  const doc = await coll.findOne({ subscriptionId });
  return doc;
}

/**
 * Mark subscription as canceled and clear period. Called when subscription.canceled webhook fires.
 */
export async function markSubscriptionCanceled(
  subscriptionId: string,
  canceledAt: string
): Promise<void> {
  const db = await getDb();
  const coll = db.collection<SubscriptionDocument>(SUBSCRIPTIONS_COLLECTION);
  await coll.updateOne(
    { subscriptionId },
    {
      $set: {
        status: "canceled",
        canceledAt,
        currentPeriodEnd: null,
        scheduledChangeEffectiveAt: null,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Clear scheduled cancellation (user chose to keep subscription). Called after Paddle PATCH.
 */
export async function clearScheduledChange(subscriptionId: string): Promise<void> {
  const db = await getDb();
  const coll = db.collection<SubscriptionDocument>(SUBSCRIPTIONS_COLLECTION);
  await coll.updateOne(
    { subscriptionId },
    {
      $set: {
        scheduledChangeEffectiveAt: null,
        updatedAt: new Date(),
      },
    }
  );
}
