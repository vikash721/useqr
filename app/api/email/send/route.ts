import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

const sendEmailBodySchema = z.object({
  /** Email type. Only "welcome" is supported (signup + waitlist confirmation in one). */
  type: z.literal("welcome"),
  /** Recipient email address. */
  to: z.string().email(),
  /** Optional recipient name for personalization. */
  name: z.string().optional().nullable(),
});

/**
 * POST /api/email/send
 * Send a transactional email. Intended for server-side use (e.g. after signup sync).
 * Body: { type: "welcome", to: string, name?: string | null }
 * Returns 200 { ok: true, id } or 400/500 with error.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = sendEmailBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, to, name } = parsed.data;

  if (type !== "welcome") {
    return NextResponse.json(
      { error: "Unsupported email type" },
      { status: 400 }
    );
  }

  const result = await sendWelcomeEmail(to, name ?? undefined);

  if (!result.success) {
    if (result.error.includes("not configured")) {
      return NextResponse.json(
        { error: result.error },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: result.id });
}
