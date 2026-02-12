# Phone number handling

This doc describes how we handle phone numbers for QR types (Phone, SMS, WhatsApp) and what to expect in the future.

## Current behavior

- **Storage**: Full number in E.164-like form (digits only, no leading zero), e.g. `919876543210` for India.
- **Normalization**: `normalizePhoneDigits()` in `lib/countries.ts` — strips non-digits and **leading zeros**. Used when building payloads, scan links, and on create/update.
- **UI**: Country code dropdown + national number field. Message is separate for SMS/WhatsApp and stored in `metadata.message`.

## Will you face issues?

### You should be fine for

- Indian numbers (leading 0 removed; +91 + 10 digits works).
- International format (E.164-style) everywhere.
- Links (`tel:`, `sms:`, `wa.me/`) — they get normalized digits only.
- Edit flow — we parse full number back to country + national and show the message from metadata.

### Possible edge cases (low impact)

1. **Shared country codes (e.g. +1)**  
   US and Canada both use +1. When we parse a stored number for edit, we match the first country in the list (e.g. US). The number and links are correct; only the country label in the dropdown can be wrong. Fix later if needed: store `metadata.countryCode` (e.g. `"US"`) when saving.

2. **No per-country length validation**  
   We accept any non-empty digit string after normalizing. So e.g. +91 123 (too short) is accepted. The link would still open; the device may or may not complete the call/SMS. Optional improvement: add length checks per country or use `libphonenumber` for validation.

3. **Very old records**  
   If you had stored "number,message" in a single `content` field for SMS, we still parse that on load and split into number + `metadata.message`. No change needed for old data.

## Optional future improvements

- **Stricter validation**: Use [libphonenumber](https://www.npmjs.com/package/libphonenumber-js) to validate length/format per country and format display numbers.
- **Remember country for +1**: Store `metadata.countryCode` when user picks a country so edit shows the same flag for +1 numbers.
- **Block obviously invalid lengths**: e.g. require at least 6–7 digits for national number (optional, in addition to or instead of libphonenumber).

## Summary

The current configuration is suitable for production: it avoids leading-zero issues (including in India), uses a single normalization path, and keeps number + message separate. The edge cases above are minor and can be improved later if you need stricter validation or perfect country display for shared dial codes.
