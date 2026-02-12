/**
 * WiFi QR code format (standard used by Android/iOS).
 * Format: WIFI:T:WPA|WEP|nopass;S:ssid;P:password;;
 * Hidden networks: H:true;
 */

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type WifiFields = {
  ssid: string;
  password: string;
  security: WifiSecurity;
};

/**
 * Builds the WIFI:... string for QR encoding.
 */
export function buildWifiString(fields: WifiFields): string {
  const { ssid, password, security } = fields;
  const T = security === "nopass" ? "nopass" : security;
  const S = ssid.trim();
  const P = password.trim();
  const parts = [`WIFI:T:${T}`, `S:${escapeWifi(S)}`, `P:${escapeWifi(P)}`];
  return parts.join(";") + ";;";
}

function escapeWifi(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
}

/**
 * Parses a WIFI:... string back to fields (for edit).
 */
export function parseWifiString(content: string): Partial<WifiFields> {
  const out: Partial<WifiFields> = { security: "WPA" };
  if (!content.trim().toUpperCase().startsWith("WIFI:")) return out;
  const rest = content.slice(5).replace(/\\;/g, "\u0001").replace(/\\\\/g, "\u0002");
  const pairs = rest.split(";").filter(Boolean);
  for (const pair of pairs) {
    const [key, ...v] = pair.split(":");
    const value = v.join(":").replace(/\u0001/g, ";").replace(/\u0002/g, "\\").trim();
    if (key === "T") out.security = (value === "WEP" ? "WEP" : value === "nopass" ? "nopass" : "WPA") as WifiSecurity;
    if (key === "S") out.ssid = value;
    if (key === "P") out.password = value;
  }
  return out;
}
