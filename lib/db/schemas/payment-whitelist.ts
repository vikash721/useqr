import { z } from "zod";

/**
 * Payment whitelist schema: emails allowed to purchase plans on production
 */
export const PaymentWhitelistSchema = z.object({
  _id: z.any().optional(),
  email: z.string().email(),
  addedBy: z.string(), // clerkId of admin who added this
  addedAt: z.date(),
  reason: z.string().optional(), // optional note about why this email is whitelisted
});

export type PaymentWhitelist = z.infer<typeof PaymentWhitelistSchema>;

export const PAYMENT_WHITELIST_COLLECTION = "payment_whitelist" as const;
