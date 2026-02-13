import { api } from "@/lib/axios";
import type { UserProfile } from "@/stores/useUserStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserSyncResponse = {
  ok: boolean;
  user: UserProfile;
};

export type WaitlistUser = {
  id: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type SubscriptionSummary = {
  subscriptionId: string;
  status: string;
  plan: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  scheduledChangeEffectiveAt: string | null;
} | null;

export type PaymentTransactionSummary = {
  transactionId: string;
  amount: number;
  currencyCode: string;
  billedAt: string;
  status: string;
  description?: string;
};

export type SubscriptionResponse = {
  subscription: SubscriptionSummary;
  transactions: PaymentTransactionSummary[];
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const usersApi = {
  /** Sync the current Clerk session to the DB (post-login / signup). */
  sync: () =>
    api.post<UserSyncResponse>("/api/users/sync").then((res) => res.data),

  /** Fetch all waitlist users (authenticated). */
  getAll: () =>
    api
      .get<{ users: WaitlistUser[] }>("/api/users")
      .then((res) => res.data.users),

  /** Get current user's subscription and payment history. */
  getSubscription: () =>
    api.get<SubscriptionResponse>("/api/users/me/subscription").then((res) => res.data),

  /** Schedule subscription cancellation at end of billing period. */
  cancelSubscription: () =>
    api
      .post<{ ok: boolean; message: string; alreadyScheduled?: boolean }>("/api/users/me/subscription/cancel")
      .then((res) => res.data),

  /** Remove scheduled cancellation so the subscription continues to renew. */
  removeScheduledCancel: () =>
    api
      .post<{ ok: boolean; message: string }>("/api/users/me/subscription/remove-cancel")
      .then((res) => res.data),

  /** Change plan (upgrade/downgrade). Proration applied by Paddle. */
  changePlan: (plan: "starter" | "pro" | "business") =>
    api
      .post<{ ok: boolean; message: string; plan: string }>("/api/users/me/subscription/change-plan", { plan })
      .then((res) => res.data),

  /** Preview prorated amount for changing to a plan. */
  getChangePlanPreview: (plan: "starter" | "pro" | "business") =>
    api
      .get<{ amountCents: number; currencyCode: string }>(
        `/api/users/me/subscription/change-plan/preview?plan=${encodeURIComponent(plan)}`
      )
      .then((res) => res.data),
} as const;
