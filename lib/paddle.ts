import { createHmac, timingSafeEqual } from "crypto";
import type { PlanSlug } from "@/lib/db/schemas/user";

/**
 * Map a Paddle price ID to our plan slug. Used by the webhook to set user plan.
 */
export function priceIdToPlanSlug(priceId: string): PlanSlug | null {
  const starter =
    process.env.PADDLE_PRICE_ID_STARTER ?? process.env.PADDLE_VENDOR_ID ?? "";
  const pro = process.env.PADDLE_PRICE_ID_PRO ?? "";
  const business = process.env.PADDLE_PRICE_ID_BUSINESS ?? "";
  if (priceId === starter) return "starter";
  if (priceId === pro) return "pro";
  if (priceId === business) return "business";
  return null;
}

/**
 * Verify Paddle webhook signature (ts:body with HMAC-SHA256).
 * Returns true if the signature is valid.
 */
export function verifyPaddleWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(";").reduce<Record<string, string>>(
    (acc, part) => {
      const [k, v] = part.split("=").map((s) => s.trim());
      if (k && v) acc[k] = v;
      return acc;
    },
    {}
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  // Replay: reject if timestamp is too old (e.g. > 5 minutes)
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (Number.isNaN(age) || age > 300) return false;
  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  const a = Buffer.from(h1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
