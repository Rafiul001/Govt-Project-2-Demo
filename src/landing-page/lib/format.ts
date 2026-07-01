/** Small formatting helpers shared across the public site. */

import type { TLanguage } from "./i18n";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert ASCII digits in a string to Bengali numerals. */
export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/** Render a number in the script of the active language. */
export function toLocaleDigits(
  input: string | number,
  lang: TLanguage,
): string {
  return lang === "bn" ? toBanglaDigits(input) : String(input);
}

/**
 * Format an ISO date as a long date in the active language —
 * e.g. "২৮ জুন ২০২৬" (bn) or "28 June 2026" (en).
 */
export function formatLocaleDate(iso: string, lang: TLanguage): string {
  const formatted = new Date(iso).toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );
  return lang === "bn" ? toBanglaDigits(formatted) : formatted;
}
