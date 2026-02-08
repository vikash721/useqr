/**
 * Server-only Telegram Bot API helper.
 * Sends a text message to the configured TELEGRAM_CHAT_ID using TELEGRAM_BOT_TOKEN.
 */

const TELEGRAM_MAX_TEXT_LENGTH = 4096;

export type SendTelegramResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Sends a text message via the Telegram Bot API to the configured chat.
 * Returns { ok: false, error } if token/chat_id missing or Telegram API fails.
 * Trims and length-limits text to Telegram's 4096 char limit.
 */
export async function sendTelegramMessage(
  text: string
): Promise<SendTelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token?.trim() || !chatId?.trim()) {
    const missing = [!token?.trim() && "TELEGRAM_BOT_TOKEN", !chatId?.trim() && "TELEGRAM_CHAT_ID"]
      .filter(Boolean)
      .join(", ");
    console.error("[telegram] Not configured — missing:", missing);
    return { ok: false, error: "Telegram not configured" };
  }

  const trimmed = text.trim().slice(0, TELEGRAM_MAX_TEXT_LENGTH);
  if (!trimmed) {
    console.error("[telegram] Message empty after trim");
    return { ok: false, error: "Message is empty after trim" };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: trimmed }),
    });

    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      const reason = data.description ?? `HTTP ${res.status}`;
      console.error("[telegram] API error:", reason, "status:", res.status);
      return { ok: false, error: reason };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[telegram] Request failed:", message);
    return { ok: false, error: message };
  }
}
