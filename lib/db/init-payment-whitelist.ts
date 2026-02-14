import { getDb } from "./mongodb";
import { PAYMENT_WHITELIST_COLLECTION } from "./schemas/payment-whitelist";

/**
 * Create indexes for payment whitelist collection
 * Run this once during setup or in a migration
 */
export async function createPaymentWhitelistIndexes() {
  const db = await getDb();
  
  // Create unique index on email for fast lookups
  await db.collection(PAYMENT_WHITELIST_COLLECTION).createIndex(
    { email: 1 },
    { unique: true }
  );
  
  // Create index on addedAt for sorting
  await db.collection(PAYMENT_WHITELIST_COLLECTION).createIndex(
    { addedAt: -1 }
  );
  
  console.log("Payment whitelist indexes created");
}
