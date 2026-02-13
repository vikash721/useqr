# Payments production go-live checklist

Use this checklist before taking payments live. Your app uses **Paddle** for billing and **Clerk** for auth.

---

## 1. Paddle: switch to production

| Step | Where | What to do |
|------|--------|------------|
| **1.1** | [Paddle Dashboard](https://vendors.paddle.com) | Ensure you’re in **Production** (not Sandbox). Create/use a **Production** account if needed. |
| **1.2** | Paddle → **Developer tools** → **Authentication** | Create or copy a **production** client-side token. Set `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` in production env to this token (no `test_` prefix). Your code auto-uses production when the token doesn’t start with `test_`. |
| **1.3** | Paddle → **Developer tools** → **Authentication** | Create or copy a **production** API key. Set `PADDLE_API_KEY` in production env (replace any `pdl_sdbx_...` sandbox key). |
| **1.4** | Paddle → **Catalog** → **Products/Prices** | Confirm your three prices exist in **production** and match the IDs in env: Starter, Pro, Business ($4.99, $11.99, $29.99). Use the **same** `pri_...` IDs in production env, or create new products in production and update env. |

---

## 2. Paddle webhook (required for plan updates)

| Step | Where | What to do |
|------|--------|------------|
| **2.1** | Paddle → **Developer tools** → **Notifications** → **Add destination** | Add your production webhook URL: `https://YOUR_DOMAIN.com/api/webhooks/paddle` |
| **2.2** | Same screen | Subscribe to: `subscription.created`, `subscription.updated`, `subscription.canceled` (plan + subscription storage), and `transaction.completed` (payment history in profile). Leave other events unsubscribed unless you need them. |
| **2.3** | Paddle → Notifications → your destination | Copy the **Endpoint secret** (or “Signing secret”). Set `PADDLE_WEBHOOK_SECRET` in production env. Without this, the webhook returns 500 and user plans won’t update after payment. |

**New destination form — what to enter:**

| Field | Value |
|-------|--------|
| **Description** | e.g. `UseQR production` or `Production – plan sync` (any short label). |
| **Notification type** | **URL** (webhook endpoint). |
| **URL** | `https://YOUR_DOMAIN.com/api/webhooks/paddle` — replace with your real domain (e.g. `https://useqr.codes/api/webhooks/paddle`). Must be HTTPS. |
| **API version** | Use the **default** or **latest** (so payloads match your app). |
| **Usage type** | **Platform only** (real events). Use "Both" only if you also want simulated/test events here. |

---

## 3. Production environment variables

Set these in your production host (Vercel, etc.):

| Variable | Required for payments | Notes |
|----------|------------------------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | `https://yourdomain.com` (no trailing slash). Used in links, sitemap, etc. |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Yes | Production client token from Paddle (no `test_`). |
| `PADDLE_API_KEY` | **Yes** (for cancel) | Production API key. Required for “Cancel subscription” in profile; optional if you never call Paddle API. |
| `PADDLE_WEBHOOK_SECRET` | **Yes** | Endpoint secret from Paddle webhook destination. |
| `PADDLE_PRICE_ID_STARTER` | Yes | `pri_...` for Starter. |
| `PADDLE_PRICE_ID_PRO` | Yes | `pri_...` for Pro. |
| `PADDLE_PRICE_ID_BUSINESS` | Yes | `pri_...` for Business. |

\* Required only if you call Paddle API from the server (e.g. cancel subscription, list invoices).

---

## 4. Clerk (auth)

| Step | Where | What to do |
|------|--------|------------|
| **4.1** | [Clerk Dashboard](https://dashboard.clerk.com) | Use **production** instance and keys. Set `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to production values. |
| **4.2** | Clerk → **Webhooks** | If you use the Clerk user-deleted webhook: add production URL `https://YOUR_DOMAIN.com/api/webhooks/clerk` and set `CLERK_WEBHOOK_SIGNING_SECRET` in production. |

---

## 5. Apple Pay (optional)

You already serve the domain verification file at `/.well-known/apple-developer-merchantid-domain-association`. For production:

- Ensure the same file is deployed (it lives in `public/.well-known/`).
- In Apple Developer → Merchant IDs → your domain, run **Verify** again with `https://yourdomain.com`.

---

## 6. After deploy: verify

1. **Webhook reachable**  
   Open `https://YOUR_DOMAIN.com/api/webhooks/paddle` in a browser. You should see `{"ok":true,"endpoint":"paddle"}`.

2. **Checkout**  
   On production, click “Get Starter” (or Pro/Business) on the pricing page. Paddle overlay should open with **live** prices (not sandbox). Complete a small real payment if possible.

3. **Plan update**  
   After payment, confirm the user’s plan updates in your app (e.g. dashboard or profile shows the paid plan). If it doesn’t, check:
   - `PADDLE_WEBHOOK_SECRET` is set and matches Paddle.
   - Paddle Notifications → your destination → “Recent deliveries” for failures.
   - Server logs for `[webhooks/paddle]` errors.

4. **Cancel flow**  
   Cancel the test subscription in Paddle (or via Paddle customer portal). Confirm the user’s plan in your app reverts to “free”.

---

## 7. Optional improvements

- **Customer portal**: Link users to Paddle’s customer portal to manage subscription, payment method, or invoices. You can get the portal URL from Paddle API or docs.
- **Tax**: If you use Paddle Tax, ensure your products/prices and business address are set correctly in Paddle for production.
- **Receipts / invoices**: Paddle sends these by email; confirm “Customer emails” (or similar) are enabled in Paddle for production.

---

## Quick reference: your webhook events

Your `app/api/webhooks/paddle/route.ts` handles:

- `subscription.created` / `subscription.updated` → set user plan from `items[0].price.id` (using `clerkId` in `custom_data`).
- `subscription.canceled` → set user plan to `free`.

Ensure `clerkId` is always passed when opening checkout (your `PaddleProvider` does this via `customData: { clerkId }` when the user is signed in).
