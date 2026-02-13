import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionByClerkId } from "@/lib/db/subscriptions";
import { planSlugToPriceId } from "@/lib/paddle";

const PADDLE_API_BASE =
  process.env.PADDLE_API_BASE ??
  (process.env.PADDLE_API_KEY?.startsWith("pdl_sdbx_")
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com");

/**
 * GET /api/users/me/subscription/change-plan/preview?plan=starter|pro|business
 * Returns the prorated amount that would be charged (or credited) if the user changed to the given plan.
 * Auth required.
 */
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const targetPlan = searchParams.get("plan") as "starter" | "pro" | "business" | null;
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
      { error: "Subscription is canceled." },
      { status: 400 }
    );
  }

  if (subscription.plan === targetPlan) {
    return NextResponse.json(
      { error: "Already on this plan." },
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

  const url = `${PADDLE_API_BASE}/subscriptions/${subscription.subscriptionId}/preview`;
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
      immediate_transaction?: {
        details?: { totals?: { total?: string } };
        currency_code?: string;
      };
      update_summary?: {
        credit?: string;
        charge?: string;
        result?: string;
      };
    };
    error?: { detail?: string };
  };

  if (!res.ok) {
    const detail =
      typeof data.error === "object" && data.error && "detail" in data.error
        ? (data.error as { detail?: string }).detail
        : "Request failed";
    console.error("[api/subscription/change-plan/preview] Paddle error:", detail);
    return NextResponse.json(
      { error: String(detail ?? "Failed to get preview") },
      { status: 400 }
    );
  }

  const imm = data.data?.immediate_transaction;
  const currencyCode = imm?.currency_code ?? "USD";
  let amountCents: number | null = null;

  const totalStr = imm?.details?.totals?.total;
  if (totalStr != null) {
    const parsed = parseFloat(String(totalStr));
    if (!Number.isNaN(parsed)) {
      amountCents = String(totalStr).includes(".")
        ? Math.round(parsed * 100)
        : Math.round(parsed);
    }
  }

  // Fallback: update_summary may have charge/credit as decimal strings
  if (amountCents === null && data.data?.update_summary) {
    const summary = data.data.update_summary;
    const chargeStr = summary.charge ?? summary.credit;
    if (chargeStr != null) {
      const parsed = parseFloat(String(chargeStr));
      if (!Number.isNaN(parsed)) {
        amountCents = String(chargeStr).includes(".")
          ? Math.round(parsed * 100)
          : Math.round(parsed);
        if (summary.credit != null && parseFloat(String(summary.credit)) > 0) {
          amountCents = -amountCents;
        }
      }
    }
  }

  return NextResponse.json({
    amountCents: amountCents ?? 0,
    currencyCode,
  });
}
