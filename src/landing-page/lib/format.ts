/**
 * Small formatting helpers shared across the public site.
 *
 * DATES ARE FORMATTED BY HAND, ON PURPOSE. These run in Server Components and
 * then hydrate in the browser, so any difference between the two renders is a
 * hydration error. `toLocaleDateString` gives us two of them:
 *
 *  1. Locale data differs by ICU version — Node and Chrome ship different CLDR
 *     releases, and Bengali month names changed between them ("জানুয়ারী" vs
 *     "জানুয়ারি"). Same input, same locale, different text.
 *  2. Without an explicit `timeZone` the server formats in the *server's* zone
 *     and the browser in the *visitor's*, which can land on different days.
 *
 * So we own the month names, and read date parts in a fixed zone. Only numeric
 * `Intl` output is used (it is stable across ICU versions); nothing here
 * depends on ICU's localized words.
 */

import type { TLanguage } from "./i18n";

/**
 * The zone every timestamp is displayed in. This is a Bangladesh government
 * portal: an event at 9am is 9am in Dhaka for every visitor, wherever they
 * are — and pinning it is also what makes SSR and hydration agree.
 */
const TIME_ZONE = "Asia/Dhaka";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Month names, indexed 0-11. Ours, so both renders always agree. */
const MONTHS: Record<TLanguage, string[]> = {
  bn: [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

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

/** A calendar date, free of any timezone. */
type TDateParts = { year: number; month: number; day: number };

// `en-CA` with numeric options yields "YYYY-MM-DD" — digits only, so its output
// does not vary with ICU's locale data the way month names do.
const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  // Explicit 00-23 cycle: `hour12: false` renders midnight as "24" on some ICU
  // versions, which would be another server/client split.
  hourCycle: "h23",
});

/**
 * The calendar date an API value falls on.
 *
 * A date-only value (`joiningDate`, `dateOfBirth` — the API's `date` columns)
 * has no time and no zone, so it is read straight off the string. Feeding it
 * to `new Date()` would parse it as UTC midnight and shift it a day backwards
 * for anyone west of Greenwich. A full timestamp is resolved in `TIME_ZONE`.
 */
function dateParts(iso: string): TDateParts | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) {
    return {
      year: Number(dateOnly[1]),
      month: Number(dateOnly[2]),
      day: Number(dateOnly[3]),
    };
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const parts = partsFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

/**
 * Format an ISO date as a long date in the active language —
 * e.g. "২৮ জুন, ২০২৬" (bn) or "28 June 2026" (en).
 */
export function formatLocaleDate(iso: string, lang: TLanguage): string {
  const parts = dateParts(iso);
  if (!parts) return "";

  const month = MONTHS[lang][parts.month - 1] ?? "";
  const day = toLocaleDigits(parts.day, lang);
  const year = toLocaleDigits(parts.year, lang);
  // Bengali convention separates the year with a comma; English does not.
  return lang === "bn"
    ? `${day} ${month}, ${year}`
    : `${day} ${month} ${year}`;
}

/**
 * Format a month header — e.g. "জুলাই ২০২৬" / "July 2026". Takes the calendar
 * month directly (`monthNumber` is 1-12) rather than a Date, since the callers
 * already hold a `YYYY-MM` string.
 */
export function formatMonthLabel(
  year: number,
  monthNumber: number,
  lang: TLanguage,
): string {
  const month = MONTHS[lang][monthNumber - 1] ?? "";
  return `${month} ${toLocaleDigits(year, lang)}`;
}

/** Localized 24-hour time in `TIME_ZONE` — e.g. "০৯:০০" / "09:00". */
export function formatLocaleTime(iso: string, lang: TLanguage): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return toLocaleDigits(timeFormatter.format(date), lang);
}
