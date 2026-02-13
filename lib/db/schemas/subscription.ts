import { z } from "zod";
import { planSlugSchema } from "./user";

export const SUBSCRIPTIONS_COLLECTION = "subscriptions" as const;

const subscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
  "paused",
  "trialing",
  "incomplete",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

/** Stored subscription snapshot for a user. Updated from Paddle webhooks. */
export const subscriptionDocumentSchema = z.object({
  clerkId: z.string().min(1),
  subscriptionId: z.string().min(1),
  paddleCustomerId: z.string().min(1).optional(),
  status: subscriptionStatusSchema,
  priceId: z.string().optional(),
  plan: planSlugSchema,
  /** ISO date string: when current period ends / next billing date. */
  currentPeriodEnd: z.string().nullable(),
  /** ISO date string: when subscription was canceled (if canceled). */
  canceledAt: z.string().nullable(),
  /** ISO date string: when scheduled cancellation takes effect (end of period). */
  scheduledChangeEffectiveAt: z.string().nullable(),
  updatedAt: z.coerce.date(),
});

export type SubscriptionDocument = z.infer<typeof subscriptionDocumentSchema>;
