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
  form_password_incorrect:
    "Incorrect email or password. Please try again.",
  form_identifier_not_found:
    "No account found with this email. Check the email or sign up.",
};

/** Raw Clerk messages we replace with simple, user-readable copy. */
const MESSAGE_REPLACEMENTS: Array<{ pattern: RegExp | string; message: string }> = [
  {
    pattern: /verification strategy is not valid for this account/i,
    message: "Incorrect email or password. Please try again.",
  },
  {
    pattern: /invalid password|incorrect password|wrong password/i,
    message: "Incorrect email or password. Please try again.",
  },
  {
    pattern: /identifier.*not found|no account found/i,
    message: "No account found with this email. Check the address or sign up.",
  },
];

function toFriendlyMessage(raw: string): string {
  for (const { pattern, message } of MESSAGE_REPLACEMENTS) {
    if (typeof pattern === "string" ? raw.includes(pattern) : pattern.test(raw)) {
      return message;
    }
  }
  return raw;
}

/**
 * Returns a user-friendly message for Clerk API errors (e.g. sign-in, OTP).
 * Maps known codes and raw messages to simple copy; falls back to longMessage/message or fallback.
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
  const message = first.message;
  const raw = (typeof longMessage === "string" ? longMessage : null) ?? (typeof message === "string" ? message : null);
  if (raw) {
    return toFriendlyMessage(raw);
  }

  return fallback;
}
