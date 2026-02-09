import { sendEmail } from "./resend";
import {
  getWelcomeEmailSubject,
  getWelcomeEmailHtml,
} from "./templates/welcome";

/**
 * Send the welcome email (thanks for signup + you're on the waitlist).
 * Single email covers both signup confirmation and waitlist confirmation.
 * Returns { success: true, id } or { success: false, error }.
 */
export async function sendWelcomeEmail(
  to: string,
  name?: string | null
): Promise<
  | { success: true; id: string }
  | { success: false; error: string }
> {
  return sendEmail({
    to,
    subject: getWelcomeEmailSubject(),
    html: getWelcomeEmailHtml({ name }),
  });
}
