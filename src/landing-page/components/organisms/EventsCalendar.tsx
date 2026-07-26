"use client";

import {
  eventsHref,
  type TEventFilters,
} from "@/components/organisms/EventsArchive";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { toBanglaDigits, toLocaleDigits } from "@/lib/format";
import { pickLang, type TLanguage } from "@/lib/i18n";
import type { TEvent } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const WEEKDAYS: Record<TLanguage, string[]> = {
  bn: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** `YYYY-MM-DD` key in local time. */
function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Buckets events by every local day they touch (start → end inclusive). */
function bucketEventsByDay(events: TEvent[]): Map<string, TEvent[]> {
  const byDay = new Map<string, TEvent[]>();
  for (const event of events) {
    const cursor = new Date(event.startAt);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(event.endAt ?? event.startAt);
    last.setHours(0, 0, 0, 0);
    for (let i = 0; cursor <= last && i < 100; i++) {
      const key = dayKey(cursor);
      const bucket = byDay.get(key);
      if (bucket) {
        bucket.push(event);
      } else {
        byDay.set(key, [event]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return byDay;
}

/** The month `delta` months away from a `YYYY-MM` month. */
function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  const shifted = new Date(year, monthIndex - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * The month-grid calendar shown below the `/events` archive: Sunday-first
 * (matching the Bangladeshi work week), with a chip per event linking to its
 * detail page. Month navigation is plain `?month=` links, so the server
 * refetches that month's events (overlap-matched, so a multi-day event appears
 * in every month it touches).
 *
 * The archive's `filters`/`page` are threaded through the prev/next links (via
 * the shared `eventsHref`) so paging the calendar does not reset the list
 * above it.
 */
export function EventsCalendar({
  events,
  month,
  filters,
  page,
}: {
  events: TEvent[];
  /** Displayed month as `YYYY-MM`. */
  month: string;
  /** The archive's active filters, preserved by the month links. */
  filters: TEventFilters;
  /** The archive's current page, likewise preserved. */
  page: number;
}) {
  const { lang, t } = useLanguage();
  const monthHref = (next: string) => eventsHref(filters, page, next);

  const [year, monthNum] = month.split("-").map(Number) as [number, number];
  const firstOfMonth = new Date(year, monthNum - 1, 1);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay(); // 0 = Sunday
  const todayKey = dayKey(new Date());
  const byDay = bucketEventsByDay(events);

  const monthLabelRaw = firstOfMonth.toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-GB",
    { month: "long", year: "numeric" },
  );
  const monthLabel =
    lang === "bn" ? toBanglaDigits(monthLabelRaw) : monthLabelRaw;

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - leadingBlanks + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="mt-10">
      <h3 className="text-lg font-bold text-slate-800">
        {t.eventsPage.calendarHeading}
      </h3>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <Link
            href={monthHref(shiftMonth(month, -1))}
            aria-label={t.eventsPage.prevMonth}
            className="rounded p-2 text-govt-green transition-colors hover:bg-slate-100"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <h4 className="text-lg font-bold text-slate-800">{monthLabel}</h4>
          <Link
            href={monthHref(shiftMonth(month, 1))}
            aria-label={t.eventsPage.nextMonth}
            className="rounded p-2 text-govt-green transition-colors hover:bg-slate-100"
          >
            <ChevronRight className="size-5" />
          </Link>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-govt-green text-center text-xs font-semibold text-white">
          {WEEKDAYS[lang].map((weekday) => (
            <div key={weekday} className="py-2">
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={index}
                  className="min-h-20 border-b border-r border-slate-100 bg-slate-50 nth-[7n]:border-r-0 sm:min-h-24"
                />
              );
            }
            const key = dayKey(new Date(year, monthNum - 1, day));
            const dayEvents = byDay.get(key) ?? [];
            const isToday = key === todayKey;

            return (
              <div
                key={index}
                className="min-h-20 space-y-1 border-b border-r border-slate-100 p-1 nth-[7n]:border-r-0 sm:min-h-24 sm:p-1.5"
              >
                <span
                  className={
                    isToday
                      ? "inline-flex size-6 items-center justify-center rounded-full bg-govt-green text-xs font-bold text-white"
                      : "inline-flex size-6 items-center justify-center text-xs font-medium text-slate-500"
                  }
                >
                  {toLocaleDigits(day, lang)}
                </span>
                {dayEvents.slice(0, 2).map((event) => {
                  const title = pickLang(lang, event.titleBn, event.titleEn);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      title={title}
                      className="block truncate rounded bg-govt-green/10 px-1 py-0.5 text-[11px] font-medium text-govt-green transition-colors hover:bg-govt-green/20 sm:px-1.5 sm:text-xs"
                    >
                      {title}
                    </Link>
                  );
                })}
                {dayEvents.length > 2 ? (
                  <p className="px-1 text-[11px] text-slate-400">
                    +{toLocaleDigits(dayEvents.length - 2, lang)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
