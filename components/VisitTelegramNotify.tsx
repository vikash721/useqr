"use client";

import { useEffect } from "react";
import { getVisitTelegramMessage } from "@/lib/visit-telegram-message";
import { telegramApi } from "@/lib/api";

const SESSION_STORAGE_KEY = "useqr-visit-telegram-sent";
const ENABLED_HOSTS = ["useqr.codes", "www.useqr.codes"];

/**
 * On production (useqr.codes) or localhost, sends a one-time Telegram message per session
 * with visit + device details when someone visits the app.
 */
export function VisitTelegramNotify() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ENABLED_HOSTS.includes(window.location.hostname)) return;
    try {
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) === "1") return;
      sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    } catch {
      return;
    }

    const message = getVisitTelegramMessage();
    if (!message) return;

    telegramApi.send(message).catch(() => {
      // Fire-and-forget; don't surface errors to the user
    });
  }, []);

  return null;
}
