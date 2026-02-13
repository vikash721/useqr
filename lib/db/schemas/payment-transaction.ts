import { z } from "zod";

export const PAYMENT_TRANSACTIONS_COLLECTION = "payment_transactions" as const;

/** Stored payment record for history. Populated from Paddle transaction webhooks. */
export const paymentTransactionSchema = z.object({
  clerkId: z.string().min(1),
  transactionId: z.string().min(1),
  subscriptionId: z.string().optional(),
  /** Total amount in smallest currency unit (e.g. cents). */
  amount: z.number().int().nonnegative(),
  currencyCode: z.string().length(3),
  /** ISO date string: when the transaction was billed. */
  billedAt: z.string(),
  status: z.enum(["completed", "billed", "paid", "past_due", "payment_failed"]),
  /** Human-readable description (e.g. "Starter — Monthly"). */
  description: z.string().optional(),
  createdAt: z.coerce.date(),
});

export type PaymentTransactionDocument = z.infer<typeof paymentTransactionSchema>;
