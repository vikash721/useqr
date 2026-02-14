import { getDb } from "./mongodb";
import {
  PAYMENT_WHITELIST_COLLECTION,
  type PaymentWhitelist,
} from "./schemas/payment-whitelist";

/**
 * Check if an email is whitelisted for payment on production
 */
export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const db = await getDb();
  const doc = await db
    .collection(PAYMENT_WHITELIST_COLLECTION)
    .findOne({ email: email.toLowerCase() });
  return !!doc;
}

/**
 * Get all whitelisted emails
 */
export async function getAllWhitelistedEmails(): Promise<PaymentWhitelist[]> {
  const db = await getDb();
  const docs = await db
    .collection(PAYMENT_WHITELIST_COLLECTION)
    .find({})
    .sort({ addedAt: -1 })
    .toArray();
  return docs as PaymentWhitelist[];
}

/**
 * Add an email to the whitelist
 */
export async function addEmailToWhitelist(
  email: string,
  addedBy: string,
  reason?: string
): Promise<void> {
  const db = await getDb();
  
  // Check if already exists
  const existing = await db
    .collection(PAYMENT_WHITELIST_COLLECTION)
    .findOne({ email: email.toLowerCase() });
  
  if (existing) {
    throw new Error("Email is already whitelisted");
  }
  
  await db.collection(PAYMENT_WHITELIST_COLLECTION).insertOne({
    email: email.toLowerCase(),
    addedBy,
    addedAt: new Date(),
    reason: reason || null,
  });
}

/**
 * Remove an email from the whitelist
 */
export async function removeEmailFromWhitelist(email: string): Promise<void> {
  const db = await getDb();
  await db
    .collection(PAYMENT_WHITELIST_COLLECTION)
    .deleteOne({ email: email.toLowerCase() });
}
