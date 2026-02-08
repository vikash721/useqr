import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 4096;
const RATE_LIMIT_REQUESTS = 25;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

/** Build IP + geo suffix from request headers (Vercel sets country/city). */
function getServerRequestSuffix(request: Request): string {
  const ip = getClientId(request);
  const country = request.headers.get("x-vercel-ip-country")?.trim() || null;
  const city = request.headers.get("x-vercel-ip-city")?.trim() || null;
  const lines = ["📍 Request (server)", `  IP:      ${ip}`];
  if (country) lines.push(`  Country: ${country}`);
  if (city) lines.push(`  City:    ${city}`);
  return lines.join("\n");
}

/**
 * POST /api/telegram/send
 * Sends a message to the configured Telegram chat via the bot.
 * No auth required. Rate limited by IP. Body: { message: string }.
 */
export async function POST(request: Request) {
  const clientId = getClientId(request);
  if (!checkRateLimit(clientId, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body.message;
  if (typeof raw !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing message" },
      { status: 400 }
    );
  }
  const message = raw.trim();
  if (!message) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 }
    );
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 }
    );
  }

  const suffix = getServerRequestSuffix(request);
  const fullMessage = `${message}\n\n${suffix}`;

  const result = await sendTelegramMessage(fullMessage);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Telegram unavailable" },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
