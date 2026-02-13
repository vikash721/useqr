import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clearScheduledChange, getSubscriptionByClerkId } from "@/lib/db/subscriptions";

const PADDLE_API_BASE =
  process.env.PADDLE_API_BASE ??
  (process.env.PADDLE_API_KEY?.startsWith("pdl_sdbx_")
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com");

/**
 * POST /api/users/me/subscription/remove-cancel
 * Removes a scheduled cancellation so the subscription continues to renew.
 * Auth required.
 */
export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Subscription management not configured" },
      { status: 500 }
    );
  }

  const subscription = await getSubscriptionByClerkId(clerkUser.id);
  if (!subscription) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  if (subscription.status === "canceled") {
    return NextResponse.json(
      { error: "Subscription is already canceled." },
      { status: 400 }
    );
  }

  if (!subscription.scheduledChangeEffectiveAt) {
    return NextResponse.json(
      { error: "No cancellation is scheduled." },
      { status: 400 }
    );
  }

  const url = `${PADDLE_API_BASE}/subscriptions/${subscription.subscriptionId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ scheduled_change: null }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: { detail?: string };
  };

  if (!res.ok) {
    const detail =
      typeof data.error === "object" && data.error && "detail" in data.error
        ? (data.error as { detail?: string }).detail
        : typeof data.error === "string"
          ? data.error
          : `Request failed`;
    console.error("[api/subscription/remove-cancel] Paddle error:", detail);
    return NextResponse.json(
      { error: String(detail ?? "Failed to remove cancellation") },
      { status: 400 }
    );
  }

  await clearScheduledChange(subscription.subscriptionId);

  return NextResponse.json({
    ok: true,
    message: "Cancellation removed. Your subscription will continue to renew.",
  });
}
