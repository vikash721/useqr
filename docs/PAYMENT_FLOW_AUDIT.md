# Payment flow – code audit summary

This document summarizes the payment and subscription flow and the safeguards in place (including fixes applied during this audit).

---

## 1. Authentication & authorization

| Endpoint | Auth | Notes |
|----------|------|------|
| `GET/POST /api/webhooks/paddle` | **Signature only** | No Clerk auth; Paddle webhook secret verifies body. Replay limited to 5 min (timestamp check). |
| `GET /api/users/me/subscription` | **Clerk** | `currentUser()`; returns only that user's subscription and transactions. |
| `GET /api/users/me/subscription/change-plan/preview?plan=` | **Clerk** | Same; preview scoped to authenticated user's subscription. |
| `POST /api/users/me/subscription/cancel` | **Clerk** | Uses `clerkUser.id` to load subscription. |
| `POST /api/users/me/subscription/remove-cancel` | **Clerk** | Same. |
| `POST /api/users/me/subscription/change-plan` | **Clerk** | Same. |
| `GET /api/paddle/price-ids` | **None** | Price IDs are not secret; used for checkout only. |

All subscription actions are scoped to the logged-in user; no way to act on another user’s subscription.

---

## 2. Checkout (new subscription)

1. **Client:** User clicks a plan → `openCheckout(planId)` with `clerkId` and email from Clerk.
2. **PaddleProvider:** Opens Paddle Checkout with `customData: { clerkId }` so Paddle can attach it to the subscription and transactions.
3. **Paddle:** Customer pays; Paddle creates subscription and sends `subscription.created` (and later `transaction.completed`).
4. **Webhook:** Signature verified; we parse `custom_data.clerkId` (or resolve from our DB by subscription id for older events). We upsert subscription and call `updateUserPlanByClerkId(clerkId, plan)`.
5. **Client:** Listens for `paddle:checkout:completed` → syncs user (plan), shows thank-you modal.

**Safeguards:** Webhook secret + timestamp; `clerkId` required for plan update; checkout only with valid price IDs from env.

---

## 3. Webhook handling (Paddle → our DB)

- **Signature:** `verifyPaddleWebhook(rawBody, paddle-signature, PADDLE_WEBHOOK_SECRET)` with HMAC-SHA256; reject if invalid or missing.
- **Replay:** Timestamp in signature must be within 5 minutes.
- **subscription.created / subscription.updated:**  
  - If `status === "canceled"`: we mark subscription canceled and set user plan to free, then return (no upsert).  
  - Otherwise we upsert subscription (plan, period, scheduled_change) and update user plan.  
  - **clerkId resolution:** If `custom_data.clerkId` is missing, we resolve from our DB by `subscriptionId` so we still handle events (e.g. `subscription.canceled`) that might not echo custom_data.
- **subscription.canceled:** Mark subscription canceled, set user to free, notify Telegram. Uses same `clerkId` (from custom_data or DB lookup). If we still have no clerkId, we log a warning.
- **transaction.completed:** Resolve clerkId from transaction custom_data or from subscription lookup. Insert payment transaction **idempotent by `transactionId`** (unique index) so duplicate webhooks don’t duplicate rows.

**Fixes applied:**  
- Resolve `clerkId` from DB when missing in payload (so cancellation at period end is always applied).  
- Handle `subscription.updated` with `status === "canceled"` (mark canceled, set user to free) so we don’t leave users on a paid plan when Paddle only sends updated.

---

## 4. Cancel (schedule at period end)

1. **Client:** Profile → “Cancel subscription” → confirmation → `POST /api/users/me/subscription/cancel`.
2. **API:** Load subscription by `clerkUser.id`. If already canceled or already scheduled, return clear message (no second Paddle call). Otherwise `POST` Paddle cancel with `effective_from: "next_billing_period"`.
3. **On success:** We update our DB from Paddle response (or GET subscription) so `scheduledChangeEffectiveAt` is set; client refetches and shows “Cancellation scheduled”.
4. **On Paddle error “pending scheduled changes” (or “subscription is canceled”):** We sync subscription from Paddle and return success so UI stays correct.

**Safeguards:** One active subscription per user (by clerkId); no double-cancel; DB updated immediately so UI doesn’t rely only on webhook timing.

---

## 5. Remove cancellation (keep subscription)

1. **Client:** “Keep my subscription” → `POST /api/users/me/subscription/remove-cancel`.
2. **API:** Load subscription by clerkId; require `scheduledChangeEffectiveAt`; `PATCH` Paddle with `scheduled_change: null`.
3. **DB:** We clear `scheduledChangeEffectiveAt` so the next GET shows “Renews on …”.

**Safeguards:** Only allowed when cancellation is scheduled; 400 if already canceled or no subscription.

---

## 6. Change plan (upgrade/downgrade)

1. **Client:** Pricing → “Change to X” → modal opens; we call `GET .../change-plan/preview?plan=X` and show amount (or credit). User confirms → `POST .../change-plan` with `{ plan }`.
2. **Preview API:** Same auth and subscription checks; calls Paddle `PATCH .../preview` with same body as change-plan; returns `amountCents` and `currencyCode`.
3. **Change-plan API:** Validate plan; load subscription by clerkId; reject if canceled or same plan. `PATCH` Paddle subscription with new `price_id` and `proration_billing_mode: "prorated_immediately"`.
4. **On success:** We upsert subscription and call `updateUserPlanByClerkId(clerkId, newPlan)` so UI and entitlements match without waiting for webhook.

**Safeguards:** Single plan per subscription (replace items with one price). Proration is immediate so no “use higher plan without paying”. Confirmation modal before charge. Preview shows amount/credit so user knows what to expect.

---

## 7. Data consistency

- **Subscription doc:** One per Paddle subscription id; updated by webhooks and by our APIs after Paddle calls (cancel, remove-cancel, change-plan).
- **User plan:** Updated when we upsert subscription (webhook) or after change-plan/cancel flow. Webhook ensures we eventually match Paddle even if an API response is missed.
- **Payment transactions:** Append-only; idempotent by `transactionId`; used only for history.

---

## 8. Edge cases covered

- Cancel when Paddle already has “pending scheduled changes” or “subscription is canceled”: we sync from Paddle and return success.
- subscription.canceled (or subscription.updated with status canceled) without custom_data: we resolve clerkId from our subscription table.
- subscription.updated with `status === "canceled"`: we mark subscription canceled and set user to free (same as subscription.canceled).
- Duplicate transaction.completed webhooks: idempotent insert by transactionId.
- Change plan to same plan / when canceled: 400 with clear message.
- Preview/change-plan when no subscription or canceled: 404/400.

---

## 9. Recommended checks before production

1. **Paddle dashboard:** Confirm webhook URL, signing secret (`PADDLE_WEBHOOK_SECRET`), and subscribed events: `subscription.created`, `subscription.updated`, `subscription.canceled`, `transaction.completed`.
2. **Checkout:** Always pass `clerkId` in custom_data (PaddleProvider does this when user is signed in).
3. **Env:** `PADDLE_API_KEY` (for cancel, remove-cancel, change-plan, preview), `PADDLE_WEBHOOK_SECRET`, and price IDs for Starter/Pro/Business set correctly.
4. **Proxy/middleware:** `/api/webhooks/paddle` is public (no Clerk); all other subscription APIs require auth.

---

## 10. Files touched in this audit

- **`app/api/webhooks/paddle/route.ts`:** Resolve clerkId from DB when missing; handle `subscription.updated` with `status === "canceled"`; warning log when subscription.canceled has no clerkId.

No other code changes were required; the rest of the flow was already consistent and secure.
