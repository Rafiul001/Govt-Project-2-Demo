import { Button } from "@heroui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { displayTitle } from "../../lib/displayTitle";
import type { TEvent } from "../../types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** `YYYY-MM-DD` key in local time (avoids UTC off-by-one from toISOString). */
function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Buckets events by every local day they touch (start → end inclusive), so a
 * multi-day event shows a chip in each of its days.
 */
function bucketEventsByDay(events: TEvent[]): Map<string, TEvent[]> {
  const byDay = new Map<string, TEvent[]>();
  for (const event of events) {
    const cursor = new Date(event.startAt);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(event.endAt ?? event.startAt);
    last.setHours(0, 0, 0, 0);
    // Safety valve so a corrupt range can never loop forever (~3 months max).
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

const MAX_CHIPS_PER_DAY = 3;

type TCalendarGridProps = {
  /** Full year, e.g. 2026. */
  year: number;
  /** Month 1–12. */
  month: number;
  events: TEvent[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onEventClick: (event: TEvent) => void;
};

/**
 * Month-grid calendar (Sunday-first week). Renders up to three event chips per
 * day plus a "+N more" note; clicking a chip opens the event. Kept
 * dependency-free — the grid is 42 cells of local-time date math.
 */
export function CalendarGrid({
  year,
  month,
  events,
  onPrevMonth,
  onNextMonth,
  onEventClick,
}: TCalendarGridProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay(); // 0 = Sunday
  const todayKey = dayKey(new Date());
  const byDay = bucketEventsByDay(events);

  const monthLabel = firstOfMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  // 42 cells (6 weeks) so the grid height never jumps between months.
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - leadingBlanks + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-secondary">
      {/* Month header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Previous month"
          onPress={onPrevMonth}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <h3 className="text-lg font-bold text-foreground">{monthLabel}</h3>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Next month"
          onPress={onNextMonth}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-tertiary text-center text-xs font-semibold uppercase tracking-wide text-muted">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={index}
                className="min-h-24 border-b border-r border-border bg-surface-tertiary/40 nth-[7n]:border-r-0"
              />
            );
          }

          const key = dayKey(new Date(year, month - 1, day));
          const dayEvents = byDay.get(key) ?? [];
          const isToday = key === todayKey;

          return (
            <div
              key={index}
              className="min-h-24 space-y-1 border-b border-r border-border p-1.5 nth-[7n]:border-r-0"
            >
              <span
                className={
                  isToday
                    ? "inline-flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
                    : "inline-flex size-6 items-center justify-center text-xs font-medium text-muted"
                }
              >
                {day}
              </span>
              {dayEvents.slice(0, MAX_CHIPS_PER_DAY).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  title={displayTitle(event.titleBn, event.titleEn)}
                  onClick={() => onEventClick(event)}
                  className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium transition-colors ${
                    event.isPublished
                      ? "bg-accent/15 text-accent hover:bg-accent/25"
                      : "bg-surface-tertiary text-muted hover:bg-surface-tertiary/80"
                  }`}
                >
                  {displayTitle(event.titleBn, event.titleEn)}
                </button>
              ))}
              {dayEvents.length > MAX_CHIPS_PER_DAY ? (
                <p className="px-1.5 text-xs text-muted">
                  +{dayEvents.length - MAX_CHIPS_PER_DAY} more
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
