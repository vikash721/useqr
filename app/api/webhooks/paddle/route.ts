import { type NextRequest, NextResponse } from "next/server";
import { insertPaymentTransaction } from "@/lib/db/payment-transactions";
import {
  getSubscriptionByClerkId,
  getSubscriptionBySubscriptionId,
  markSubscriptionCanceled,
  upsertSubscription,
} from "@/lib/db/subscriptions";
import { getUserByClerkId, updateUserPlanByClerkId } from "@/lib/db/users";
import { priceIdToPlanSlug, verifyPaddleWebhook } from "@/lib/paddle";
import {
  notifyTelegramSubscriptionActive,
  notifyTelegramSubscriptionCanceled,
} from "@/lib/telegram/payment-notifications";

/**
 * GET /api/webhooks/paddle
 * Health check for the webhook URL.
 */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "paddle" }, { status: 200 });
}

/**
 * POST /api/webhooks/paddle
 * Paddle Billing webhook. Verify signature, then handle subscription events
 * to update user plan in our DB.
 *
 * Configure this URL in Paddle: Developer tools → Notifications → Add destination.
 * Subscribe to: subscription.created, subscription.updated, subscription.canceled.
 * Set PADDLE_WEBHOOK_SECRET to the endpoint secret Paddle gives you.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/paddle] Missing PADDLE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");
  if (!verifyPaddleWebhook(rawBody, signature, secret)) {
    console.error("[webhooks/paddle] Invalid signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  type SubscriptionData = {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: Record<string, string>;
    next_billed_at?: string | null;
    current_billing_period?: { starts_at?: string; ends_at?: string } | null;
    canceled_at?: string | null;
    scheduled_change?: { effective_at?: string; action?: string } | null;
    items?: Array<{ price?: { id?: string } }>;
  };
  type TransactionData = {
    id?: string;
    subscription_id?: string | null;
    custom_data?: Record<string, string>;
    currency_code?: string;
    created_at?: string;
    details?: { totals?: { total?: string } };
    status?: string;
  };

  let payload: {
    event_type?: string;
    data?: SubscriptionData | TransactionData;
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[webhooks/paddle] Invalid JSON");
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const eventType = payload.event_type;
  const data = payload.data;
  if (!eventType || !data) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const subData = data as SubscriptionData;
  let clerkId: string | null =
    typeof subData.custom_data === "object" && subData.custom_data?.clerkId
      ? subData.custom_data.clerkId
      : null;
  if (!clerkId && subData.id) {
    const sub = await getSubscriptionBySubscriptionId(subData.id);
    clerkId = sub?.clerkId ?? null;
  }

  if (eventType === "subscription.created" || eventType === "subscription.updated") {
    if (subData.status === "canceled") {
      if (clerkId) {
        const userBefore = await getUserByClerkId(clerkId);
        const previousPlan = userBefore?.plan ?? "free";
        if (subData.id) {
          await markSubscriptionCanceled(subData.id, subData.canceled_at ?? new Date().toISOString());
        }
        await updateUserPlanByClerkId(clerkId, "free");
        await notifyTelegramSubscriptionCanceled({ user: userBefore, previousPlan });
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }
    const firstPriceId = subData.items?.[0]?.price?.id;
    const plan = firstPriceId ? priceIdToPlanSlug(firstPriceId) : null;
    if (clerkId && plan && subData.id) {
      const status = (subData.status === "active" || subData.status === "trialing" || subData.status === "paused"
        ? subData.status
        : "active") as "active" | "trialing" | "paused";
      const currentPeriodEnd =
        subData.next_billed_at ??
        subData.current_billing_period?.ends_at ??
        null;
      const scheduledChangeEffectiveAt =
        subData.scheduled_change?.effective_at ?? null;
      await upsertSubscription({
        clerkId,
        subscriptionId: subData.id,
        paddleCustomerId: subData.customer_id,
        status,
        priceId: firstPriceId,
        plan,
        currentPeriodEnd,
        canceledAt: subData.canceled_at ?? null,
        scheduledChangeEffectiveAt,
      });
      const updated = await updateUserPlanByClerkId(clerkId, plan);
      console.log("[webhooks/paddle] Plan updated", {
        eventType,
        clerkId,
        plan,
        updated: !!updated,
      });
      await notifyTelegramSubscriptionActive({
        eventType,
        user: updated ?? (await getUserByClerkId(clerkId)),
        plan,
      });
    } else if (!clerkId) {
      console.warn("[webhooks/paddle] No clerkId in custom_data", {
        eventType,
        custom_data: subData.custom_data,
      });
    }
  } else if (eventType === "subscription.canceled") {
    if (clerkId) {
      const userBefore = await getUserByClerkId(clerkId);
      const previousPlan = userBefore?.plan ?? "free";
      if (subData.id) {
        await markSubscriptionCanceled(subData.id, subData.canceled_at ?? new Date().toISOString());
      }
      await updateUserPlanByClerkId(clerkId, "free");
      console.log("[webhooks/paddle] Subscription canceled, set to free", { clerkId });
      await notifyTelegramSubscriptionCanceled({
        user: userBefore,
        previousPlan,
      });
    } else if (subData.id) {
      console.warn("[webhooks/paddle] subscription.canceled: no clerkId for subscription", {
        subscriptionId: subData.id,
      });
    }
  } else if (eventType === "transaction.completed") {
    const txnData = data as TransactionData;
    const txnId = txnData.id;
    const subscriptionId = txnData.subscription_id ?? null;
    let resolvedClerkId: string | null =
      typeof txnData.custom_data === "object" && txnData.custom_data?.clerkId
        ? txnData.custom_data.clerkId
        : null;
    if (!resolvedClerkId && subscriptionId) {
      const sub = await getSubscriptionBySubscriptionId(subscriptionId);
      resolvedClerkId = sub?.clerkId ?? null;
    }
    if (resolvedClerkId && txnId) {
      const amountStr = txnData.details?.totals?.total;
      let amount = 0;
      if (amountStr != null) {
        const parsed = parseFloat(String(amountStr));
        if (!Number.isNaN(parsed)) {
          amount = String(amountStr).includes(".")
            ? Math.round(parsed * 100)
            : Math.round(parsed);
        }
      }
      await insertPaymentTransaction({
        clerkId: resolvedClerkId,
        transactionId: txnId,
        subscriptionId: subscriptionId ?? undefined,
        amount,
        currencyCode: txnData.currency_code ?? "USD",
        billedAt: txnData.created_at ?? new Date().toISOString(),
        status: "completed",
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
