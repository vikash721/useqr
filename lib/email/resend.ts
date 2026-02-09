import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";
import { FROM_HEADER } from "./constants";

let resendClient: Resend | null = null;

/**
 * Get Resend client. Returns null if RESEND_API_KEY is not set.
 */
export function getResendClient(): Resend | null {
  if (resendClient !== null) return resendClient;
  const env = getServerEnv();
  if (!env.RESEND_API_KEY) return null;
  resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  /** Override from (default: UseQR <welcome@useqr.codes>) */
  from?: string;
};

/**
 * Send a single email via Resend. Returns { success: true, id } or { success: false, error }.
 * If RESEND_API_KEY is not set, returns { success: false, error: "Email not configured" }.
 */
export async function sendEmail(params: SendEmailParams): Promise<
  | { success: true; id: string }
  | { success: false; error: string }
> {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: "Email not configured (RESEND_API_KEY missing)" };
  }

  const to = Array.isArray(params.to) ? params.to : [params.to];
  if (to.length === 0 || !to.every((e) => typeof e === "string" && e.includes("@"))) {
    return { success: false, error: "Invalid recipient" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: params.from ?? FROM_HEADER,
      to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      return { success: false, error: error.message ?? String(error) };
    }
    return { success: true, id: data?.id ?? "unknown" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
