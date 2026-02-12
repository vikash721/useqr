/**
 * vCard 3.0 format builder for QR contact cards.
 * Escapes semicolons and newlines per vCard spec.
 */

export type VCardFields = {
  firstName?: string;
  lastName?: string;
  organization?: string;
  phone?: string;
  email?: string;
};

function vcardEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

/**
 * Builds a vCard 3.0 string from fields. Used for QR content storage.
 */
export function buildVCard(fields: VCardFields): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const fn = [fields.firstName, fields.lastName].filter(Boolean).join(" ").trim();
  if (fn) lines.push(`FN:${vcardEscape(fn)}`);
  if (fields.firstName?.trim()) lines.push(`N:${vcardEscape(fields.lastName ?? "")};${vcardEscape(fields.firstName)};;;`);
  if (fields.organization?.trim()) lines.push(`ORG:${vcardEscape(fields.organization.trim())}`);
  if (fields.phone?.trim()) lines.push(`TEL:${fields.phone.replace(/\D/g, "")}`);
  if (fields.email?.trim()) lines.push(`EMAIL:${vcardEscape(fields.email.trim())}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/**
 * Parses a vCard 3.0 string into fields (best-effort for display/edit).
 */
export function parseVCard(content: string): Partial<VCardFields> {
  const out: Partial<VCardFields> = {};
  const raw = content.replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").replace(/\\n/g, "\n").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
    if (!key || !value) continue;
    const k = key.toUpperCase();
    if (k === "FN") out.firstName = value; // we'll put full name in firstName when parsing for edit
    if (k === "N") {
      const parts = value.split(";").map((p) => p.replace(/\\/g, "").trim());
      if (parts[1]) out.firstName = parts[1];
      if (parts[0]) out.lastName = parts[0];
    }
    if (k === "ORG") out.organization = value;
    if (k === "TEL") out.phone = value;
    if (k === "EMAIL") out.email = value;
  }
  if (out.firstName && !out.lastName && out.firstName.includes(" ")) {
    const [last, ...firstParts] = out.firstName.split(/\s+/).reverse();
    out.lastName = last;
    out.firstName = firstParts.reverse().join(" ");
  }
  return out;
}
