import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionByClerkId, upsertSubscription } from "@/lib/db/subscriptions";
import { updateUserPlanByClerkId } from "@/lib/db/users";
import { planSlugToPriceId } from "@/lib/paddle";
import type { PlanSlug } from "@/lib/db/schemas/user";

const PADDLE_API_BASE =
  process.env.PADDLE_API_BASE ??
  (process.env.PADDLE_API_KEY?.startsWith("pdl_sdbx_")
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com");

type ChangePlanBody = { plan: "starter" | "pro" | "business" };

/**
 * POST /api/users/me/subscription/change-plan
 * Change the user's plan (upgrade/downgrade). Uses Paddle PATCH subscription with proration.
 * Auth required.
 */
export async function POST(request: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Plan change not configured" },
      { status: 500 }
    );
  }

  let body: ChangePlanBody;
  try {
    body = (await request.json()) as ChangePlanBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const targetPlan = body.plan;
  if (!targetPlan || !["starter", "pro", "business"].includes(targetPlan)) {
    return NextResponse.json(
      { error: "Invalid plan. Use starter, pro, or business." },
      { status: 400 }
    );
  }

  const subscription = await getSubscriptionByClerkId(clerkUser.id);
  if (!subscription) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  if (subscription.status === "canceled") {
    return NextResponse.json(
      { error: "Subscription is canceled. Resubscribe from the pricing page." },
      { status: 400 }
    );
  }

  const currentPlan = subscription.plan;
  if (currentPlan === targetPlan) {
    return NextResponse.json(
      { error: "You are already on this plan." },
      { status: 400 }
    );
  }

  const newPriceId = planSlugToPriceId(targetPlan);
  if (!newPriceId) {
    return NextResponse.json(
      { error: "Price not configured for this plan." },
      { status: 500 }
    );
  }

  const url = `${PADDLE_API_BASE}/subscriptions/${subscription.subscriptionId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ price_id: newPriceId, quantity: 1 }],
      proration_billing_mode: "prorated_immediately",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    data?: {
      items?: Array<{ price?: { id?: string } }>;
      next_billed_at?: string | null;
      current_billing_period?: { ends_at?: string } | null;
      scheduled_change?: { effective_at?: string } | null;
      status?: string;
    };
    error?: { detail?: string };
  };

  if (!res.ok) {
    const detail =
      typeof data.error === "object" && data.error && "detail" in data.error
        ? (data.error as { detail?: string }).detail
        : typeof data.error === "string"
          ? data.error
          : "Request failed";
    console.error("[api/subscription/change-plan] Paddle error:", detail);
    return NextResponse.json(
      { error: String(detail ?? "Failed to change plan") },
      { status: 400 }
    );
  }

  const paddleSub = data.data;
  const plan = targetPlan as PlanSlug;
  const priceId = paddleSub?.items?.[0]?.price?.id ?? newPriceId;
  const currentPeriodEnd =
    paddleSub?.next_billed_at ??
    paddleSub?.current_billing_period?.ends_at ??
    subscription.currentPeriodEnd;
  const scheduledChangeEffectiveAt =
    paddleSub?.scheduled_change?.effective_at ??
    subscription.scheduledChangeEffectiveAt;
  const status = (paddleSub?.status === "active" ||
    paddleSub?.status === "trialing" ||
    paddleSub?.status === "paused"
    ? paddleSub.status
    : subscription.status) as "active" | "trialing" | "paused";

  await upsertSubscription({
    clerkId: clerkUser.id,
    subscriptionId: subscription.subscriptionId,
    paddleCustomerId: subscription.paddleCustomerId,
    status,
    priceId,
    plan,
    currentPeriodEnd,
    canceledAt: subscription.canceledAt,
    scheduledChangeEffectiveAt,
  });

  await updateUserPlanByClerkId(clerkUser.id, plan);

  return NextResponse.json({
    ok: true,
    message: `Plan changed to ${targetPlan}. Proration has been applied.`,
    plan,
  });
}
