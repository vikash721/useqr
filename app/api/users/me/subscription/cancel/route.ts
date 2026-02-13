import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionByClerkId, upsertSubscription } from "@/lib/db/subscriptions";
import { priceIdToPlanSlug } from "@/lib/paddle";

const PADDLE_API_BASE =
  process.env.PADDLE_API_BASE ??
  (process.env.PADDLE_API_KEY?.startsWith("pdl_sdbx_")
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com");

/** Fetch subscription from Paddle and sync scheduled_change + period into our DB. */
async function syncSubscriptionFromPaddle(
  subscriptionId: string,
  clerkId: string,
  existingPlan: import("@/lib/db/schemas/user").PlanSlug,
  apiKey: string
): Promise<{ scheduledChangeEffectiveAt: string | null; currentPeriodEnd: string | null }> {
  const res = await fetch(`${PADDLE_API_BASE}/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) return { scheduledChangeEffectiveAt: null, currentPeriodEnd: null };
  const json = (await res.json()) as {
    data?: {
      scheduled_change?: { effective_at?: string } | null;
      current_billing_period?: { ends_at?: string } | null;
      next_billed_at?: string | null;
      status?: string;
      items?: Array<{ price?: { id?: string } }>;
    };
  };
  const d = json.data;
  const scheduledChangeEffectiveAt = d?.scheduled_change?.effective_at ?? null;
  const currentPeriodEnd =
    d?.next_billed_at ?? d?.current_billing_period?.ends_at ?? null;
  const priceId = d?.items?.[0]?.price?.id;
  const plan = (priceId ? priceIdToPlanSlug(priceId) : null) ?? existingPlan;
  const status = (d?.status === "active" || d?.status === "trialing" || d?.status === "paused"
    ? d.status
    : "active") as "active" | "trialing" | "paused";
  await upsertSubscription({
    clerkId,
    subscriptionId,
    status,
    priceId,
    plan,
    currentPeriodEnd,
    canceledAt: null,
    scheduledChangeEffectiveAt,
  });
  return { scheduledChangeEffectiveAt, currentPeriodEnd };
}

/**
 * POST /api/users/me/subscription/cancel
 * Schedules cancellation at the end of the billing period (user keeps access until then).
 * Auth required.
 */
export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey?.trim()) {
    console.error("[api/subscription/cancel] Missing PADDLE_API_KEY");
    return NextResponse.json(
      { error: "Subscription cancel not configured" },
      { status: 500 }
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
      { error: "Subscription is already canceled." },
      { status: 400 }
    );
  }

  if (subscription.scheduledChangeEffectiveAt) {
    const date = subscription.scheduledChangeEffectiveAt;
    return NextResponse.json({
      ok: true,
      message: `Cancellation already scheduled. Access until ${date}`,
      alreadyScheduled: true,
    });
  }

  const url = `${PADDLE_API_BASE}/subscriptions/${subscription.subscriptionId}/cancel`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ effective_from: "next_billing_period" }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    data?: {
      scheduled_change?: { effective_at?: string } | null;
      current_billing_period?: { ends_at?: string } | null;
      next_billed_at?: string | null;
      items?: Array<{ price?: { id?: string } }>;
    };
    error?: { code?: string; detail?: string };
  };

  if (!res.ok) {
    const raw = typeof data.error === "object" && data.error && "detail" in data.error
      ? (data.error as { detail?: string }).detail
      : typeof data.error === "string"
        ? data.error
        : `HTTP ${res.status}`;
    const rawStr = String(raw ?? "Request failed");

    // Paddle already has a scheduled cancellation — sync our DB from Paddle and tell the user.
    if (/pending scheduled changes|cannot update subscription, as subscription is canceled/i.test(rawStr)) {
      const synced = await syncSubscriptionFromPaddle(
        subscription.subscriptionId,
        clerkUser.id,
        subscription.plan,
        apiKey
      );
      const date = synced.scheduledChangeEffectiveAt ?? subscription.scheduledChangeEffectiveAt ?? subscription.currentPeriodEnd;
      return NextResponse.json({
        ok: true,
        message: date
          ? `Cancellation already scheduled. Access until ${date}`
          : "Cancellation already scheduled.",
        alreadyScheduled: true,
      });
    }

    const detail = rawStr.replace(
      /cannot update subscription, as subscription is canceled/i,
      "Subscription is already canceled."
    );
    console.error("[api/subscription/cancel] Paddle error:", detail);
    return NextResponse.json(
      { error: detail },
      { status: 400 }
    );
  }

  // Update our DB immediately so the client refetch shows "Cancellation scheduled" and date
  const paddleSub = data.data;
  if (paddleSub?.scheduled_change?.effective_at) {
    const scheduledChangeEffectiveAt = paddleSub.scheduled_change.effective_at;
    const currentPeriodEnd =
      paddleSub.next_billed_at ?? paddleSub.current_billing_period?.ends_at ?? subscription.currentPeriodEnd;
    const priceId = paddleSub.items?.[0]?.price?.id ?? subscription.priceId;
    const plan = (priceId ? priceIdToPlanSlug(priceId) : null) ?? subscription.plan;
    await upsertSubscription({
      clerkId: clerkUser.id,
      subscriptionId: subscription.subscriptionId,
      paddleCustomerId: subscription.paddleCustomerId,
      status: subscription.status,
      priceId: priceId ?? undefined,
      plan,
      currentPeriodEnd,
      canceledAt: null,
      scheduledChangeEffectiveAt,
    });
  } else {
    // Paddle response may not include full subscription; fetch and sync so UI updates immediately
    await syncSubscriptionFromPaddle(
      subscription.subscriptionId,
      clerkUser.id,
      subscription.plan,
      apiKey
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Subscription will cancel at the end of your billing period. You'll keep access until then.",
  });
}
