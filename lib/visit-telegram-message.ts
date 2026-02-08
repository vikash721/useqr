/**
 * Builds a structured visit + device message for Telegram.
 * Only call from the client (e.g. inside useEffect); uses window/navigator/screen.
 */
export function getVisitTelegramMessage(): string {
  if (typeof window === "undefined") return "";

  const now = new Date().toISOString();
  const url = window.location.href;
  const path = window.location.pathname;
  const referrer = document.referrer || "(none)";
  const ua = navigator.userAgent;
  const language = navigator.language;
  const languages = navigator.languages?.length
    ? Array.from(navigator.languages).join(", ")
    : language;
  const platform = navigator.platform ?? "(unknown)";
  const cookieEnabled = navigator.cookieEnabled;
  const screenW = window.screen?.width ?? "(unknown)";
  const screenH = window.screen?.height ?? "(unknown)";
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  const timezone =
    typeof Intl !== "undefined" && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "(unknown)";
  const deviceMemory =
    "deviceMemory" in navigator && typeof (navigator as { deviceMemory?: number }).deviceMemory === "number"
      ? `${(navigator as { deviceMemory: number }).deviceMemory} GB`
      : "(unknown)";
  const connection =
    "connection" in navigator &&
    (navigator as { connection?: { effectiveType?: string } }).connection
      ? (navigator as { connection: { effectiveType: string } }).connection.effectiveType
      : "(unknown)";

  const isAmView =
    (path === "/" || path === "") &&
    typeof URLSearchParams !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "am";

  const lines = [
    ...(isAmView
      ? [
          "⭐️⭐️⭐️ AM VIEW VISIT ⭐️⭐️⭐️",
          "🎯 Someone opened the AM view!",
          "📊 /?view=am",
          "",
        ]
      : []),
    "🟢 New visit — UseQR (production)",
    "",
    "📍 Visit",
    `  Time:     ${now}`,
    `  URL:      ${url}`,
    `  Path:     ${path}`,
    `  Referrer: ${referrer}`,
    "",
    "🖥️ Device & viewport",
    `  Screen:   ${screenW} × ${screenH}`,
    `  Viewport: ${innerW} × ${innerH}`,
    `  Platform: ${platform}`,
    `  Language: ${languages}`,
    `  Timezone: ${timezone}`,
    `  Memory:   ${deviceMemory}`,
    `  Network:  ${connection}`,
    `  Cookies:  ${cookieEnabled ? "enabled" : "disabled"}`,
    "",
    "🔧 User agent",
    `  ${ua}`,
  ];

  return lines.join("\n");
}
