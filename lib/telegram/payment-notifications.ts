import type { PlanSlug, UserDocument } from "@/lib/db/schemas/user";
import { sendTelegramMessage } from "@/lib/telegram";

const PLAN_LABELS: Record<PlanSlug, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

const PLAN_PRICES: Record<Exclude<PlanSlug, "free">, string> = {
  starter: "$4.99/mo",
  pro: "$11.99/mo",
  business: "$29.99/mo",
};

function formatUserLine(user: UserDocument | null): string {
  if (!user) return "User: (unknown)";
  const parts: string[] = [];
  if (user.email) parts.push(user.email);
  if (user.name?.trim()) parts.push(`(${user.name.trim()})`);
  if (user.clerkId) parts.push(`clerk: ${user.clerkId}`);
  return "User: " + (parts.length ? parts.join(" ") : user.clerkId);
}

/**
 * Send a Telegram notification for subscription created or updated.
 */
export async function notifyTelegramSubscriptionActive(params: {
  eventType: "subscription.created" | "subscription.updated";
  user: UserDocument | null;
  plan: PlanSlug;
}): Promise<void> {
  const label = PLAN_LABELS[params.plan];
  const price =
    params.plan === "free"
      ? ""
      : PLAN_PRICES[params.plan as keyof typeof PLAN_PRICES] ?? "";
  const title =
    params.eventType === "subscription.created"
      ? "🟢 New subscription"
      : "🟡 Subscription updated";
  const lines = [
    title,
    "",
    formatUserLine(params.user),
    `Plan: ${label}${price ? ` — ${price}` : ""}`,
    `Event: ${params.eventType}`,
  ];
  const text = lines.join("\n");
  const result = await sendTelegramMessage(text);
  if (!result.ok) {
    console.warn("[telegram/payment] Failed to send subscription active notification:", result.error);
  }
}

/**
 * Send a Telegram notification for subscription canceled.
 */
export async function notifyTelegramSubscriptionCanceled(params: {
  user: UserDocument | null;
  previousPlan: PlanSlug;
}): Promise<void> {
  const label = PLAN_LABELS[params.previousPlan];
  const lines = [
    "🔴 Subscription canceled",
    "",
    formatUserLine(params.user),
    `Previous plan: ${label}`,
    "Plan set to: Free",
  ];
  const text = lines.join("\n");
  const result = await sendTelegramMessage(text);
  if (!result.ok) {
    console.warn("[telegram/payment] Failed to send subscription canceled notification:", result.error);
  }
}
