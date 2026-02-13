import { getDb } from "@/lib/db/mongodb";
import {
  PAYMENT_TRANSACTIONS_COLLECTION,
  type PaymentTransactionDocument,
} from "@/lib/db/schemas/payment-transaction";

export async function ensurePaymentTransactionIndexes(): Promise<void> {
  const db = await getDb();
  const coll = db.collection(PAYMENT_TRANSACTIONS_COLLECTION);
  await coll.createIndex({ clerkId: 1, billedAt: -1 });
  await coll.createIndex({ transactionId: 1 }, { unique: true });
}

/**
 * Insert a payment transaction (idempotent by transactionId). Called from Paddle webhooks.
 */
export async function insertPaymentTransaction(doc: {
  clerkId: string;
  transactionId: string;
  subscriptionId?: string;
  amount: number;
  currencyCode: string;
  billedAt: string;
  status: PaymentTransactionDocument["status"];
  description?: string;
}): Promise<void> {
  await ensurePaymentTransactionIndexes();
  const db = await getDb();
  const coll = db.collection<PaymentTransactionDocument>(PAYMENT_TRANSACTIONS_COLLECTION);
  const existing = await coll.findOne({ transactionId: doc.transactionId });
  if (existing) return;
  await coll.insertOne({
    ...doc,
    createdAt: new Date(),
  });
}

/** Get payment history for a user, newest first. */
export async function getPaymentTransactionsByClerkId(
  clerkId: string,
  limit = 50
): Promise<PaymentTransactionDocument[]> {
  const db = await getDb();
  const coll = db.collection<PaymentTransactionDocument>(PAYMENT_TRANSACTIONS_COLLECTION);
  const cursor = coll.find({ clerkId }).sort({ billedAt: -1 }).limit(limit);
  return cursor.toArray();
}
