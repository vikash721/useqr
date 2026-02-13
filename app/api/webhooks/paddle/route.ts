import { type NextRequest, NextResponse } from "next/server";
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

  let payload: {
    event_type?: string;
    data?: {
      custom_data?: Record<string, string>;
      items?: Array<{ price?: { id?: string } }>;
    };
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

  const clerkId =
    typeof data.custom_data === "object" && data.custom_data?.clerkId
      ? data.custom_data.clerkId
      : null;

  if (eventType === "subscription.created" || eventType === "subscription.updated") {
    const firstPriceId = data.items?.[0]?.price?.id;
    const plan = firstPriceId ? priceIdToPlanSlug(firstPriceId) : null;
    if (clerkId && plan) {
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
        custom_data: data.custom_data,
      });
    }
  } else if (eventType === "subscription.canceled") {
    if (clerkId) {
      const userBefore = await getUserByClerkId(clerkId);
      const previousPlan = userBefore?.plan ?? "free";
      const updated = await updateUserPlanByClerkId(clerkId, "free");
      console.log("[webhooks/paddle] Subscription canceled, set to free", {
        clerkId,
        updated: !!updated,
      });
      await notifyTelegramSubscriptionCanceled({
        user: userBefore,
        previousPlan,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
