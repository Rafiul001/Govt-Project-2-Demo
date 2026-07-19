"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toBanglaDigits, toLocaleDigits } from "@/lib/format";
import { pickLang, withBranch, type TLanguage } from "@/lib/i18n";
import type { TEvent } from "@/lib/types";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
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

/** Localized time like "০৯:০০" / "09:00". */
function formatTime(iso: string, lang: TLanguage): string {
  const formatted = new Date(iso).toLocaleTimeString(
    lang === "bn" ? "bn-BD" : "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  );
  return lang === "bn" ? toBanglaDigits(formatted) : formatted;
}

/** One event of the month's list below the calendar. */
function EventListItem({ event }: { event: TEvent }) {
  const { lang, t } = useLanguage();
  const title = pickLang(lang, event.titleBn, event.titleEn);
  const description = pickLang(lang, event.descriptionBn, event.descriptionEn);

  return (
    <article className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:block">
        {event.image ? (
          <Image
            src={event.image}
            alt={title}
            fill
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-govt-green/40">
            <CalendarDays className="size-8" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-bold leading-tight text-slate-800">{title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <CalendarDays className="size-4 shrink-0 text-govt-green" />
          {formatLocaleDate(event.startAt, lang)}, {formatTime(event.startAt, lang)}
          {event.endAt
            ? ` — ${formatLocaleDate(event.endAt, lang)}, ${formatTime(event.endAt, lang)}`
            : null}
        </p>
        {event.venue ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="size-4 shrink-0 text-govt-green" />
            {t.events.venue}: {event.venue}
          </p>
        ) : null}
        {description ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/**
 * The `/events` page body: a month-grid calendar (Sunday-first, matching the
 * Bangladeshi work week) with event chips, month navigation via `?month=`
 * links (server refetches that month's events, overlap-matched), and the
 * month's events listed below.
 */
export function EventsCalendar({
  events,
  month,
  branchName,
}: {
  events: TEvent[];
  /** Displayed month as `YYYY-MM`. */
  month: string;
  branchName?: string | null;
}) {
  const { lang, t } = useLanguage();

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
  const monthLabel = lang === "bn" ? toBanglaDigits(monthLabelRaw) : monthLabelRaw;

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - leadingBlanks + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const monthEvents = [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.eventsPage.backHome}
        </Link>

        <div className="mt-4">
          <SectionHeading
            title={t.eventsPage.heading}
            subtitle={withBranch(t.eventsPage.subtitle, branchName)}
          />
        </div>

        {/* Calendar */}
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <Link
              href={`/events?month=${shiftMonth(month, -1)}`}
              aria-label={t.eventsPage.prevMonth}
              className="rounded p-2 text-govt-green transition-colors hover:bg-slate-100"
            >
              <ChevronLeft className="size-5" />
            </Link>
            <h3 className="text-lg font-bold text-slate-800">{monthLabel}</h3>
            <Link
              href={`/events?month=${shiftMonth(month, 1)}`}
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
                  {dayEvents.slice(0, 2).map((event) => (
                    <p
                      key={event.id}
                      title={pickLang(lang, event.titleBn, event.titleEn)}
                      className="truncate rounded bg-govt-green/10 px-1 py-0.5 text-[11px] font-medium text-govt-green sm:px-1.5 sm:text-xs"
                    >
                      {pickLang(lang, event.titleBn, event.titleEn)}
                    </p>
                  ))}
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

        {/* This month's events */}
        <h3 className="mt-10 text-lg font-bold text-slate-800">
          {t.eventsPage.listHeading}
        </h3>
        {monthEvents.length > 0 ? (
          <div className="mt-4 space-y-4">
            {monthEvents.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.eventsPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
