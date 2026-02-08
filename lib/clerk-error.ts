type ClerkErrorItem = {
  code?: string;
  message?: string;
  longMessage?: string;
  long_message?: string;
};

type ClerkLikeError = {
  errors?: ClerkErrorItem[];
};

const CODE_MESSAGES: Record<string, string> = {
  form_code_incorrect:
    "The code you entered is incorrect. Please check the code and try again.",
  verification_failed:
    "The code you entered is incorrect or has expired. Please try again or request a new code.",
};

/**
 * Returns a user-friendly message for Clerk API errors (e.g. OTP/code errors).
 * Maps known codes (e.g. form_code_incorrect) to clear copy and falls back to
 * longMessage/message or the provided fallback.
 */
export function getClerkErrorMessage(
  err: unknown,
  fallback: string = "Something went wrong."
): string {
  if (!err || typeof err !== "object" || !("errors" in err)) {
    return fallback;
  }
  const list = (err as ClerkLikeError).errors;
  const first = Array.isArray(list) ? list[0] : undefined;
  if (!first) return fallback;

  const code = first.code;
  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  const longMessage = first.longMessage ?? first.long_message;
  if (longMessage && typeof longMessage === "string") {
    return longMessage;
  }

  if (first.message && typeof first.message === "string") {
    return first.message;
  }

  return fallback;
}
