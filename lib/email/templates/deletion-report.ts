import type { DeleteUserDataResult } from "@/lib/db/delete-user-data";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getDeletionReportSubject(): string {
  return "UseQR — User deletion report";
}

export function getDeletionReportHtml(options: {
  clerkId: string;
  result: DeleteUserDataResult;
  timestamp: string;
}): string {
  const { userDeleted, qrsDeleted, scanEventsDeleted } = options.result;

  const rows = [
    ["Clerk user ID", escapeHtml(options.clerkId)],
    ["Deletion time (UTC)", escapeHtml(options.timestamp)],
    ["User record deleted", userDeleted ? "Yes" : "No"],
    ["QR codes deleted", String(qrsDeleted)],
    ["Scan/analytics events deleted", String(scanEventsDeleted)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:10px 16px;border:1px solid rgba(255,255,255,0.08);color:#a1a1aa;font-size:14px;">${label}</td>
          <td style="padding:10px 16px;border:1px solid rgba(255,255,255,0.08);color:#fafafa;font-size:14px;font-family:ui-monospace,monospace;">${value}</td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(getDeletionReportSubject())}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td style="padding:40px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#fafafa;">User deletion report</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#171717;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#e4e4e7;">A user was deleted from Clerk (dashboard or API). The following data was removed from your app database:</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                <thead>
                  <tr>
                    <th style="padding:10px 16px;border:1px solid rgba(255,255,255,0.08);text-align:left;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Detail</th>
                    <th style="padding:10px 16px;border:1px solid rgba(255,255,255,0.08);text-align:left;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#71717a;">This is an automated report from the UseQR Clerk webhook (user.deleted).</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#52525b;">UseQR — User deletion notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}
