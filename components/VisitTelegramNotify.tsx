"use client";

import { useEffect } from "react";
import { getVisitTelegramMessage } from "@/lib/visit-telegram-message";

const SESSION_STORAGE_KEY = "useqr-visit-telegram-sent";
const ENABLED_HOSTS = ["useqr.codes", "localhost", "127.0.0.1", "www.useqr.codes"];

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

    fetch("/api/telegram/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }).catch(() => {
      // Fire-and-forget; don't surface errors to the user
    });
  }, []);

  return null;
}
