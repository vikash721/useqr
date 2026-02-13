import { NextResponse } from "next/server";

/**
 * GET /api/paddle/price-ids
 * Returns Paddle price IDs for each plan. Used by the client to open checkout.
 * Price IDs are not secret; this route avoids needing NEXT_PUBLIC_ for each.
 */
export async function GET() {
  const starter =
    process.env.PADDLE_PRICE_ID_STARTER ?? process.env.PADDLE_VENDOR_ID ?? null;
  const pro = process.env.PADDLE_PRICE_ID_PRO ?? null;
  const business = process.env.PADDLE_PRICE_ID_BUSINESS ?? null;

  return NextResponse.json({
    starter,
    pro,
    business,
  });
}
