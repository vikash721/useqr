import { api } from "@/lib/axios";

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const telegramApi = {
  /** Fire-and-forget visit notification. */
  send: (message: string) =>
    api.post<void>("/api/telegram/send", { message }),
} as const;
