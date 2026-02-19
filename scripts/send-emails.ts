#!/usr/bin/env npx tsx
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                   UseQR — Bulk Email Sender                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Usage:  npm run send-emails                                    ║
 * ║          npx tsx scripts/send-emails.ts                         ║
 * ║                                                                  ║
 * ║  1. Edit the CONFIG section below                               ║
 * ║  2. Run the script                                              ║
 * ║  3. Check the report in scripts/send-emails-report.json         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { Resend } from "resend";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Load environment variables ──────────────────────────────────────────────
// Simple .env parser — no dotenv dependency needed
const root = path.resolve(__dirname, "..");
function loadEnvFile(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        // Don't overwrite existing env vars
        if (!(key in process.env)) process.env[key] = val;
    }
}
// .env.local takes precedence over .env
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ██  CONFIG — EDIT THIS SECTION BEFORE RUNNING  ████████████████████████████
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * List of recipients.
 * You can also load from a JSON file:
 *   const RECIPIENTS = JSON.parse(fs.readFileSync("scripts/recipients.json", "utf-8"));
 *
 * Or from a CSV (one email per line, optional name after comma):
 *   const RECIPIENTS = fs.readFileSync("scripts/recipients.csv", "utf-8")
 *     .trim().split("\n").map(line => {
 *       const [email, name] = line.split(",").map(s => s.trim());
 *       return { email, name };
 *     });
 */
const RECIPIENTS: { email: string; name?: string }[] = [
    { email: "yuktithakral@gmail.com", name: "Yukti" },
    { email: "sakshamkinra@gmail.com", name: "Saksham" },
    { email: "rahul870389@gmail.com", name: "Rahul" },
    { email: "vikashkumar355555@gmail.com", name: "Vikash" },
    { email: "progamervivek2020@gmail.com", name: "Vivek" },
    { email: "rahulxyz123u@gmail.com", name: "Rahul" },
    { email: "prarthnaprayer2@gmail.com", name: "Prarthna" },
    { email: "palakthakur2212007@gmail.com", name: "Palak" },
    { email: "ankitmalik844903@gmail.com", name: "Ankit" },
    { email: "mdumar5725@gmail.com", name: "Umar" }
];

/** Email subject line. */
const SUBJECT = "We just made UseQR faster for you ⚡";

/**
 * Email HTML body.
 * Use {{name}} as a placeholder — it will be replaced with the recipient's
 * name (or "there" if no name is provided).
 *
 * You can also use one of the built-in templates:
 *   import { getWelcomeEmailHtml } from "../lib/email/templates/welcome";
 *   const HTML = getWelcomeEmailHtml({ name: "{{name}}" });
 */
const BASE_URL = "https://useqr.codes";
const LOGO_URL = `${BASE_URL}/logo/png/logo.png`;

const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${SUBJECT}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <a href="${BASE_URL}" style="text-decoration:none;display:inline-block;">
                <img src="${LOGO_URL}" alt="UseQR" width="120" height="40" style="display:block;height:40px;width:auto;max-width:120px;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#171717;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.4);">

              <!-- Greeting -->
              <p style="margin:0 0 24px;font-size:20px;line-height:1.4;color:#fafafa;font-weight:600;">Hi {{name}} 👋</p>

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#e4e4e7;">
                We've been working behind the scenes to make UseQR faster and smoother for you. Here's what's new:
              </p>

              <!-- Update 1 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;width:100%;">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;width:28px;">
                    <div style="width:28px;height:28px;border-radius:8px;background-color:rgba(16,185,129,0.15);text-align:center;line-height:28px;font-size:14px;">⚡</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#fafafa;">Lightning-fast dashboard</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#a1a1aa;">Your dashboard now loads significantly faster. We've optimized how data is fetched so pages feel near-instant — no more waiting around.</p>
                  </td>
                </tr>
              </table>

              <!-- Update 2 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;width:100%;">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;width:28px;">
                    <div style="width:28px;height:28px;border-radius:8px;background-color:rgba(16,185,129,0.15);text-align:center;line-height:28px;font-size:14px;">🔄</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#fafafa;">Smarter data updates</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#a1a1aa;">When you edit, delete, or toggle settings on a QR code, changes now reflect instantly — no page refresh needed. If something goes wrong, it rolls back automatically.</p>
                  </td>
                </tr>
              </table>

              <!-- Update 3 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;width:100%;">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;width:28px;">
                    <div style="width:28px;height:28px;border-radius:8px;background-color:rgba(16,185,129,0.15);text-align:center;line-height:28px;font-size:14px;">🚀</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#fafafa;">Faster server responses</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#a1a1aa;">We've improved our backend to respond quicker to every action you take — creating, editing, and managing QR codes is now noticeably snappier.</p>
                  </td>
                </tr>
              </table>

              <!-- Update 4 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;width:100%;">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;width:28px;">
                    <div style="width:28px;height:28px;border-radius:8px;background-color:rgba(16,185,129,0.15);text-align:center;line-height:28px;font-size:14px;">🛡️</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#fafafa;">Better error handling</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#a1a1aa;">If something doesn't work as expected, you'll now see clear, helpful messages instead of blank screens. We've also added smart retry logic for temporary hiccups.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#e4e4e7;">
                We're committed to making UseQR the best experience for you. More updates are on the way — stay tuned!
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;width:100%;">
                <tr>
                  <td align="center">
                    <a href="${BASE_URL}/dashboard" style="display:inline-block;background-color:#10b981;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.02em;">Open your dashboard →</a>
                  </td>
                </tr>
              </table>

              <!-- Support note -->
              <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#a1a1aa;text-align:center;">
                Have a question, need help, or just want to explore a feature?<br/>
                We'd love to hear from you — reach out anytime at<br/>
                <a href="mailto:support@useqr.codes" style="color:#10b981;text-decoration:none;font-weight:500;">support@useqr.codes</a>
              </p>

              <!-- Sign-off -->
              <p style="margin:28px 0 0;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);font-size:14px;line-height:1.5;color:#71717a;text-align:center;">
                Thanks for being part of UseQR. 💚<br/>
                <span style="color:#52525b;">— UseQR team</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;">
                <a href="${BASE_URL}" style="color:#71717a;text-decoration:none;">useqr.codes</a>
                <span style="color:rgba(255,255,255,0.15);margin:0 8px;">·</span>
                <a href="${BASE_URL}/pricing" style="color:#71717a;text-decoration:none;">Pricing</a>
                <span style="color:rgba(255,255,255,0.15);margin:0 8px;">·</span>
                <a href="${BASE_URL}/contact" style="color:#71717a;text-decoration:none;">Contact</a>
              </p>
              <p style="margin:0;font-size:11px;color:#3f3f46;">You're receiving this because you have an account at UseQR.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

/** Sender identity (must be a verified domain in Resend). */
const FROM = "UseQR <updates@useqr.codes>";

/** Set to true to preview without actually sending any emails. */
const DRY_RUN = false;

/** Max emails per second (Resend free = 2/sec, paid = 10/sec). */
const RATE_LIMIT = 2;

/** Max retry attempts for failed emails. */
const MAX_RETRIES = 2;

/** Base delay (ms) for exponential backoff on retries. */
const RETRY_BASE_DELAY_MS = 2000;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ██  INTERNALS — NO NEED TO EDIT BELOW  ████████████████████████████████████
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type SendResult = {
    email: string;
    name?: string;
    status: "sent" | "failed" | "dry-run";
    id?: string;
    error?: string;
    attempt: number;
    timestamp: string;
};

const REPORT_PATH = path.join(__dirname, "send-emails-report.json");

/** Simple delay */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Personalise HTML by replacing {{name}} */
function personalise(html: string, name?: string): string {
    const displayName = name?.trim() || "there";
    return html.replace(/\{\{name\}\}/g, displayName);
}

/** Format a log prefix with timestamp */
function logPrefix(): string {
    return `[${new Date().toLocaleTimeString()}]`;
}

/** Rate-limited sender with retry queue */
async function run() {
    // ── Validate ──────────────────────────────────────────────────────────────
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey && !DRY_RUN) {
        console.error("❌  RESEND_API_KEY not found in environment. Set it in .env or .env.local");
        process.exit(1);
    }

    if (RECIPIENTS.length === 0) {
        console.error("❌  No recipients defined. Edit the RECIPIENTS array in the script.");
        process.exit(1);
    }

    // De-duplicate by email
    const seen = new Set<string>();
    const uniqueRecipients = RECIPIENTS.filter((r) => {
        const key = r.email.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (uniqueRecipients.length !== RECIPIENTS.length) {
        console.warn(
            `⚠️  Removed ${RECIPIENTS.length - uniqueRecipients.length} duplicate(s). Sending to ${uniqueRecipients.length} unique recipients.`
        );
    }

    const resend = DRY_RUN ? null : new Resend(apiKey!);
    const delayBetweenSends = Math.ceil(1000 / RATE_LIMIT);

    console.log("");
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║              UseQR — Bulk Email Sender                   ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log("");
    console.log(`  📧  Recipients:   ${uniqueRecipients.length}`);
    console.log(`  📝  Subject:      ${SUBJECT}`);
    console.log(`  📮  From:         ${FROM}`);
    console.log(`  ⏱️   Rate limit:   ${RATE_LIMIT}/sec (${delayBetweenSends}ms delay)`);
    console.log(`  🔁  Max retries:  ${MAX_RETRIES}`);
    console.log(`  ${DRY_RUN ? "🧪  Mode:         DRY RUN (no emails will be sent)" : "🚀  Mode:         LIVE"}`);
    console.log("");
    console.log("─".repeat(58));
    console.log("");

    // ── Main pass ─────────────────────────────────────────────────────────────
    const results: SendResult[] = [];
    const failed: { recipient: (typeof uniqueRecipients)[0]; error: string }[] = [];

    for (let i = 0; i < uniqueRecipients.length; i++) {
        const recipient = uniqueRecipients[i];
        const idx = `[${String(i + 1).padStart(String(uniqueRecipients.length).length)}/${uniqueRecipients.length}]`;

        if (DRY_RUN) {
            console.log(`${logPrefix()} ${idx} 🧪 (dry-run) ${recipient.email}${recipient.name ? ` (${recipient.name})` : ""}`);
            results.push({
                email: recipient.email,
                name: recipient.name,
                status: "dry-run",
                attempt: 1,
                timestamp: new Date().toISOString(),
            });
            continue;
        }

        try {
            const html = personalise(HTML, recipient.name);
            const { data, error } = await resend!.emails.send({
                from: FROM,
                to: recipient.email,
                subject: SUBJECT,
                html,
            });

            if (error) {
                console.log(`${logPrefix()} ${idx} ❌ ${recipient.email} — ${error.message}`);
                failed.push({ recipient, error: error.message });
                results.push({
                    email: recipient.email,
                    name: recipient.name,
                    status: "failed",
                    error: error.message,
                    attempt: 1,
                    timestamp: new Date().toISOString(),
                });
            } else {
                console.log(`${logPrefix()} ${idx} ✅ ${recipient.email} (id: ${data?.id ?? "?"})`);
                results.push({
                    email: recipient.email,
                    name: recipient.name,
                    status: "sent",
                    id: data?.id,
                    attempt: 1,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.log(`${logPrefix()} ${idx} ❌ ${recipient.email} — ${message}`);
            failed.push({ recipient, error: message });
            results.push({
                email: recipient.email,
                name: recipient.name,
                status: "failed",
                error: message,
                attempt: 1,
                timestamp: new Date().toISOString(),
            });
        }

        // Rate limit delay (skip after last email)
        if (i < uniqueRecipients.length - 1) {
            await sleep(delayBetweenSends);
        }
    }

    // ── Retry failed emails ───────────────────────────────────────────────────
    if (failed.length > 0 && !DRY_RUN) {
        console.log("");
        console.log("─".repeat(58));
        console.log(`\n🔁  Retrying ${failed.length} failed email(s)...\n`);

        let retryQueue = [...failed];

        for (let attempt = 2; attempt <= MAX_RETRIES + 1 && retryQueue.length > 0; attempt++) {
            const backoffMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 2);
            console.log(`  ⏳ Attempt ${attempt}/${MAX_RETRIES + 1} — waiting ${(backoffMs / 1000).toFixed(1)}s before retry...\n`);
            await sleep(backoffMs);

            const stillFailing: typeof retryQueue = [];

            for (let i = 0; i < retryQueue.length; i++) {
                const { recipient } = retryQueue[i];
                const idx = `[${i + 1}/${retryQueue.length}]`;

                try {
                    const html = personalise(HTML, recipient.name);
                    const { data, error } = await resend!.emails.send({
                        from: FROM,
                        to: recipient.email,
                        subject: SUBJECT,
                        html,
                    });

                    // Update the result entry
                    const resultIdx = results.findIndex((r) => r.email === recipient.email);

                    if (error) {
                        console.log(`${logPrefix()} ${idx} ❌ (retry) ${recipient.email} — ${error.message}`);
                        stillFailing.push({ recipient, error: error.message });
                        if (resultIdx >= 0) {
                            results[resultIdx].error = error.message;
                            results[resultIdx].attempt = attempt;
                            results[resultIdx].timestamp = new Date().toISOString();
                        }
                    } else {
                        console.log(`${logPrefix()} ${idx} ✅ (retry) ${recipient.email} (id: ${data?.id ?? "?"})`);
                        if (resultIdx >= 0) {
                            results[resultIdx].status = "sent";
                            results[resultIdx].id = data?.id;
                            results[resultIdx].error = undefined;
                            results[resultIdx].attempt = attempt;
                            results[resultIdx].timestamp = new Date().toISOString();
                        }
                    }
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    console.log(`${logPrefix()} ${idx} ❌ (retry) ${recipient.email} — ${message}`);
                    stillFailing.push({ recipient, error: message });
                    const resultIdx = results.findIndex((r) => r.email === recipient.email);
                    if (resultIdx >= 0) {
                        results[resultIdx].error = message;
                        results[resultIdx].attempt = attempt;
                        results[resultIdx].timestamp = new Date().toISOString();
                    }
                }

                if (i < retryQueue.length - 1) {
                    await sleep(delayBetweenSends);
                }
            }

            retryQueue = stillFailing;
        }
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const sent = results.filter((r) => r.status === "sent").length;
    const failedFinal = results.filter((r) => r.status === "failed").length;
    const dryRun = results.filter((r) => r.status === "dry-run").length;

    console.log("");
    console.log("─".repeat(58));
    console.log("");
    console.log("📊  Summary");
    console.log("");
    if (dryRun > 0) console.log(`  🧪  Dry-run:  ${dryRun}`);
    if (sent > 0) console.log(`  ✅  Sent:     ${sent}`);
    if (failedFinal > 0) {
        console.log(`  ❌  Failed:   ${failedFinal}`);
        console.log("");
        console.log("  Permanently failed:");
        results
            .filter((r) => r.status === "failed")
            .forEach((r) => {
                console.log(`    • ${r.email} — ${r.error}`);
            });
    }
    console.log("");

    // ── Write report ──────────────────────────────────────────────────────────
    const report = {
        timestamp: new Date().toISOString(),
        mode: DRY_RUN ? "dry-run" : "live",
        config: {
            subject: SUBJECT,
            from: FROM,
            rateLimit: RATE_LIMIT,
            maxRetries: MAX_RETRIES,
        },
        totals: { sent, failed: failedFinal, dryRun, total: results.length },
        results,
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`📄  Report saved to: ${path.relative(root, REPORT_PATH)}`);
    console.log("");
}

// ── Execute ─────────────────────────────────────────────────────────────────
run().catch((err) => {
    console.error("💥  Unexpected error:", err);
    process.exit(1);
});
