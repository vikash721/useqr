/**
 * Country calling codes for phone/SMS/WhatsApp inputs.
 * ISO 3166-1 alpha-2 code, name, and E.164 dial code.
 * Flags are derived from ISO code (regional indicator symbols).
 */

export type CountryOption = {
  code: string;
  name: string;
  dial: string;
};

/** Convert ISO 3166-1 alpha-2 (e.g. US) to flag emoji (e.g. 🇺🇸). */
export function countryToFlag(iso: string): string {
  if (!iso || iso.length !== 2) return "";
  return iso
    .toUpperCase()
    .replace(/./g, (c) =>
      String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
    );
}

/** Countries with dial code — common ones first, then alphabetical by name. */
export const COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States", dial: "+1" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "CZ", name: "Czech Republic", dial: "+420" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AD", name: "Andorra", dial: "+376" },
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "AG", name: "Antigua and Barbuda", dial: "+1268" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BJ", name: "Benin", dial: "+229" },
  { code: "BT", name: "Bhutan", dial: "+975" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { code: "BW", name: "Botswana", dial: "+267" },
  { code: "BN", name: "Brunei", dial: "+673" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "BF", name: "Burkina Faso", dial: "+226" },
  { code: "BI", name: "Burundi", dial: "+257" },
  { code: "KH", name: "Cambodia", dial: "+855" },
  { code: "CM", name: "Cameroon", dial: "+237" },
  { code: "CV", name: "Cape Verde", dial: "+238" },
  { code: "CF", name: "Central African Republic", dial: "+236" },
  { code: "TD", name: "Chad", dial: "+235" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CU", name: "Cuba", dial: "+53" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "SV", name: "El Salvador", dial: "+503" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FJ", name: "Fiji", dial: "+679" },
  { code: "GA", name: "Gabon", dial: "+241" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "IR", name: "Iran", dial: "+98" },
  { code: "IQ", name: "Iraq", dial: "+964" },
  { code: "JM", name: "Jamaica", dial: "+1876" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LY", name: "Libya", dial: "+218" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MO", name: "Macau", dial: "+853" },
  { code: "MK", name: "North Macedonia", dial: "+389" },
  { code: "MG", name: "Madagascar", dial: "+261" },
  { code: "MW", name: "Malawi", dial: "+265" },
  { code: "MT", name: "Malta", dial: "+356" },
  { code: "MU", name: "Mauritius", dial: "+230" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MC", name: "Monaco", dial: "+377" },
  { code: "MN", name: "Mongolia", dial: "+976" },
  { code: "ME", name: "Montenegro", dial: "+382" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MZ", name: "Mozambique", dial: "+258" },
  { code: "MM", name: "Myanmar", dial: "+95" },
  { code: "NA", name: "Namibia", dial: "+264" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NI", name: "Nicaragua", dial: "+505" },
  { code: "NE", name: "Niger", dial: "+227" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "SN", name: "Senegal", dial: "+221" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SD", name: "Sudan", dial: "+249" },
  { code: "SZ", name: "Eswatini", dial: "+268" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
];

/**
 * Normalizes phone input for global use: digits only, no leading zeros.
 * Leading zeros are invalid with country code (e.g. Indian 09876... → 9876... with +91).
 * This matches E.164-style international format and avoids issues in Indian and other systems.
 * Note: We do not validate length per country; invalid lengths may still be accepted.
 * For strict validation consider libphonenumber in the future.
 */
export function normalizePhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+/, "") || "";
}

/** Find country by dial code (e.g. "+91" -> India). */
export function getCountryByDial(dial: string): CountryOption | undefined {
  const normalized = dial.startsWith("+") ? dial : `+${dial}`;
  return COUNTRIES.find((c) => c.dial === normalized);
}

/**
 * Parse full number to extract dial + national part. Tries longest dial prefix first.
 * Caveat: +1 matches US first (same dial as Canada); edit may show US for a Canadian number.
 * The stored number and links are still correct.
 */
export function parseDialFromFullNumber(fullNumber: string): { dial: string; national: string } {
  const digits = normalizePhoneDigits(fullNumber) || fullNumber.replace(/\D/g, "");
  if (!digits.length) return { dial: "+1", national: "" };
  const byLen = [...COUNTRIES]
    .map((c) => ({ ...c, dialDigits: c.dial.replace(/\D/g, "") }))
    .filter((c) => c.dialDigits.length >= 1)
    .sort((a, b) => b.dialDigits.length - a.dialDigits.length);
  for (const { dial, dialDigits } of byLen) {
    if (digits.startsWith(dialDigits)) {
      const national = normalizePhoneDigits(digits.slice(dialDigits.length));
      return { dial, national };
    }
  }
  return { dial: "+1", national: normalizePhoneDigits(digits) };
}
