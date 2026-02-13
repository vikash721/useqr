import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPaymentTransactionsByClerkId } from "@/lib/db/payment-transactions";
import { getSubscriptionByClerkId } from "@/lib/db/subscriptions";

/**
 * GET /api/users/me/subscription
 * Returns the current user's subscription (if any) and payment history.
 * Auth required.
 */
export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [subscription, transactions] = await Promise.all([
      getSubscriptionByClerkId(clerkUser.id),
      getPaymentTransactionsByClerkId(clerkUser.id),
    ]);

    return NextResponse.json({
      subscription: subscription
        ? {
            subscriptionId: subscription.subscriptionId,
            status: subscription.status,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
            canceledAt: subscription.canceledAt,
            scheduledChangeEffectiveAt: subscription.scheduledChangeEffectiveAt,
          }
        : null,
      transactions: transactions.map((t) => ({
        transactionId: t.transactionId,
        amount: t.amount,
        currencyCode: t.currencyCode,
        billedAt: t.billedAt,
        status: t.status,
        description: t.description,
      })),
    });
  } catch (err) {
    console.error("[api/users/me/subscription]", err);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
