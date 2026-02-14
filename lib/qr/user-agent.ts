import type { DeviceType } from "@/lib/db/schemas/analytics";

// ── Regex tables ────────────────────────────────────────────────────────────

const TABLET_RE =
  /ipad|android(?!.*mobile)|kindle|playbook|silk|nexus\s?(7|9|10)|sm-t|gt-p|tab/i;

const MOBILE_RE =
  /mobile|android|webos|iphone|ipod|blackberry|iemobile|opera\s?mini|windows\s?phone/i;

// Browser detection (order matters — more specific first)
const BROWSER_RULES: [RegExp, string][] = [
  [/edg(e|a|ios)?\//i, "Edge"],
  [/opr\//i, "Opera"],
  [/samsungbrowser\//i, "Samsung Browser"],
  [/ucbrowser\//i, "UC Browser"],
  [/firefox|fxios\//i, "Firefox"],
  [/crios\//i, "Chrome"], // Chrome on iOS
  [/chrome\//i, "Chrome"],
  [/safari\//i, "Safari"], // Must come after Chrome (Chrome UA includes Safari)
];

// OS detection
const OS_RULES: [RegExp, string][] = [
  [/windows\s?phone/i, "Windows Phone"],
  [/windows/i, "Windows"],
  [/macintosh|mac\s?os/i, "macOS"],
  [/iphone|ipad|ipod/i, "iOS"],
  [/android/i, "Android"],
  [/linux/i, "Linux"],
  [/cros/i, "Chrome OS"],
];

// ── Parsers ─────────────────────────────────────────────────────────────────

/** Determine device type from a User-Agent string. */
export function parseDeviceType(ua: string): DeviceType {
  if (TABLET_RE.test(ua)) return "tablet";
  if (MOBILE_RE.test(ua)) return "mobile";
  return "desktop";
}

/** Best-effort browser name from a User-Agent string. */
export function parseBrowserName(ua: string): string | undefined {
  for (const [re, name] of BROWSER_RULES) {
    if (re.test(ua)) return name;
  }
  return undefined;
}

/** Best-effort OS name from a User-Agent string. */
export function parseOsName(ua: string): string | undefined {
  for (const [re, name] of OS_RULES) {
    if (re.test(ua)) return name;
  }
  return undefined;
}
