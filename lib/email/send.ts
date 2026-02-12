import type { DeleteUserDataResult } from "@/lib/db/delete-user-data";
import { sendEmail } from "./resend";
import {
  getDeletionReportSubject,
  getDeletionReportHtml,
} from "./templates/deletion-report";
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

/** Default recipient for user-deletion reports (used when DELETION_REPORT_EMAIL is not set). */
const DEFAULT_DELETION_REPORT_EMAIL = "vikashkumar355555@gmail.com";

/**
 * Send a detailed user-deletion report to the configured admin email.
 * Uses DELETION_REPORT_EMAIL if set, otherwise vikashkumar355555@gmail.com.
 */
export async function sendDeletionReportEmail(
  clerkId: string,
  result: DeleteUserDataResult
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const to =
    typeof process.env.DELETION_REPORT_EMAIL === "string" &&
    process.env.DELETION_REPORT_EMAIL.trim() !== ""
      ? process.env.DELETION_REPORT_EMAIL.trim()
      : DEFAULT_DELETION_REPORT_EMAIL;
  const timestamp = new Date().toISOString();
  return sendEmail({
    to,
    subject: getDeletionReportSubject(),
    html: getDeletionReportHtml({ clerkId, result, timestamp }),
  });
}
