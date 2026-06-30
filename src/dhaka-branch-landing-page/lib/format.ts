/** Small formatting helpers shared across the public site. */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert ASCII digits in a string to Bengali numerals. */
export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/** Format an ISO date as a Bengali long date, e.g. "২৮ জুন ২০২৬". */
export function formatBanglaDate(iso: string): string {
  return toBanglaDigits(
    new Date(iso).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
}
