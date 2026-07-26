"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toLocaleDigits } from "@/lib/format";
import { pickLang, withBranch } from "@/lib/i18n";
import type { TEvent } from "@/lib/types";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

/** The "when" filter: the whole archive, or one side of today. */
export type TEventWhen = "all" | "upcoming" | "past";

export type TEventFilters = {
  search: string;
  when: TEventWhen;
  from: string;
  to: string;
};

/**
 * `/events` URL carrying the given backend filters (empty ones omitted).
 *
 * The single URL builder for the page: the archive's search/pagination links
 * and the calendar's month navigation both go through it, so each control
 * preserves the other's state instead of resetting it.
 */
export function eventsHref(
  filters: TEventFilters,
  page: number,
  /** Calendar month (`YYYY-MM`); omitted keeps the default (current) month. */
  month?: string,
): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.when !== "all") params.set("when", filters.when);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  if (month) params.set("month", month);
  const qs = params.toString();
  return qs ? `/events?${qs}` : "/events";
}

/** Page numbers to render: all of them, or a window with `null` ellipses. */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const wanted = [1, current - 1, current, current + 1, total]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let prev = 0;
  for (const p of wanted) {
    if (p === prev) continue;
    if (p - prev > 1) result.push(null);
    result.push(p);
    prev = p;
  }
  return result;
}

/** One event of the archive grid — the whole card links to its detail page. */
function EventCard({ event }: { event: TEvent }) {
  const { lang, t } = useLanguage();
  const title = pickLang(lang, event.titleBn, event.titleEn);
  const description = pickLang(lang, event.descriptionBn, event.descriptionEn);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full bg-slate-100">
        {event.image ? (
          <Image
            src={event.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-govt-green/40">
            <CalendarDays className="size-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t-4 border-govt-green px-4 py-4">
        <h3 className="font-bold leading-tight text-slate-800 group-hover:text-govt-green">
          {title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
          <CalendarDays className="size-4 shrink-0 text-govt-green" />
          {formatLocaleDate(event.startAt, lang)}
        </p>
        {event.venue ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="size-4 shrink-0 text-govt-green" />
            {event.venue}
          </p>
        ) : null}
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
        <span className="mt-3 text-sm font-semibold text-govt-green">
          {t.eventsPage.readMore}
        </span>
      </div>
    </Link>
  );
}

/** How long a filter change settles before it is pushed to the URL. */
const FILTER_DEBOUNCE_MS = 350;

/**
 * The `/events` page body: every published event of the branch, filterable and
 * paginated.
 *
 * A first-time visitor lands on the unfiltered archive — all events, newest
 * first. Search, the upcoming/past switch and the date window are *backend*
 * filters that live in the query string (`?search=`, `?when=`, `?from=`,
 * `?to=`, `?page=`), so the resulting view is shareable and survives a reload.
 *
 * Every control applies itself: the component owns a `draft` of the filters so
 * the UI reacts instantly (the chip highlights on click, the field shows each
 * keystroke), and a debounce pushes that draft into the query string, which
 * re-runs the server query. No control depends on the Search button — that
 * button only skips the wait. The month calendar is rendered separately below
 * by the page, and its `?month=` is carried through every navigation so
 * filtering the list never resets the calendar.
 */
export function EventsArchive({
  events,
  total,
  page,
  totalPages,
  filters,
  month,
  branchName,
}: {
  events: TEvent[];
  total: number;
  page: number;
  totalPages: number;
  filters: TEventFilters;
  /** Calendar month (`YYYY-MM`), preserved across filter changes. */
  month?: string;
  branchName?: string | null;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const href = useCallback(
    (next: TEventFilters, toPage: number) => eventsHref(next, toPage, month),
    [month],
  );

  // The filters as the user is editing them. Kept separate from `filters`
  // (which describes the list currently on screen) so the controls stay
  // responsive while the debounced navigation is still in flight.
  const [draft, setDraft] = useState(filters);

  // Adopt filters that changed outside our own typing — a "clear filters"
  // click, browser back/forward, a shared link. Compared as the URL they
  // produce so a re-render with an equal-but-new object is not mistaken for a
  // change. Done during render (not in an effect) so the inputs never flash
  // the stale value; our own debounced pushes arrive here already matching.
  const serverKey = eventsHref(filters, 1);
  const [seenKey, setSeenKey] = useState(serverKey);
  if (serverKey !== seenKey) {
    setSeenKey(serverKey);
    setDraft(filters);
  }

  // Debounce the draft into the URL. `replace` rather than `push` so a
  // keystroke-by-keystroke search does not bury the previous page in history,
  // and `scroll: false` so the page does not jump while refining filters.
  const draftKey = eventsHref(draft, 1);
  useEffect(() => {
    if (draftKey === serverKey) return;
    const id = setTimeout(() => {
      startTransition(() => {
        router.replace(href(draft, 1), { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draftKey, serverKey, draft, href, router]);

  const isFiltered =
    Boolean(filters.search) ||
    filters.when !== "all" ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  // Submitting (Enter, or the Search button) just skips the debounce.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      router.replace(href(draft, 1), { scroll: false });
    });
  };

  const whenOptions: { value: TEventWhen; label: string }[] = [
    { value: "all", label: t.eventsPage.filterAll },
    { value: "upcoming", label: t.eventsPage.filterUpcoming },
    { value: "past", label: t.eventsPage.filterPast },
  ];

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
            title={t.eventsPage.allHeading}
            subtitle={withBranch(t.eventsPage.subtitle, branchName)}
          />
        </div>

        {/* Filters — all backend filters, submitted into the query string. */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="event-search"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                {t.eventsPage.searchAction}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="event-search"
                  type="search"
                  name="search"
                  value={draft.search}
                  onChange={(e) =>
                    setDraft({ ...draft, search: e.target.value })
                  }
                  placeholder={t.eventsPage.searchPlaceholder}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-govt-green focus:ring-2 focus:ring-govt-green/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="event-from"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                {t.eventsPage.fromDate}
              </label>
              <input
                id="event-from"
                type="date"
                name="from"
                value={draft.from}
                onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-govt-green focus:ring-2 focus:ring-govt-green/20"
              />
            </div>

            <div>
              <label
                htmlFor="event-to"
                className="mb-1 block text-xs font-semibold text-slate-500"
              >
                {t.eventsPage.toDate}
              </label>
              <input
                id="event-to"
                type="date"
                name="to"
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-govt-green focus:ring-2 focus:ring-govt-green/20"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-govt-green px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-govt-green/90"
            >
              {t.eventsPage.searchAction}
            </button>
          </div>

          {/* Upcoming / past switch. Radios (not links) so the group is
              keyboard-navigable and announced as one control; picking one
              updates the draft, which the debounce applies. */}
          <div
            role="radiogroup"
            aria-label={t.eventsPage.allHeading}
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            {whenOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  draft.when === option.value
                    ? "border-govt-green bg-govt-green text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-govt-green hover:text-govt-green"
                }`}
              >
                <input
                  type="radio"
                  name="when"
                  value={option.value}
                  checked={draft.when === option.value}
                  onChange={() => setDraft({ ...draft, when: option.value })}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}

            {/* Live region: the count below changes without a page load, so
                announce that a refresh is under way. */}
            <span aria-live="polite" className="sr-only">
              {isPending ? t.eventsPage.searchAction : ""}
            </span>

            {isFiltered || draft.when !== "all" || draft.search || draft.from || draft.to ? (
              <button
                type="button"
                onClick={() =>
                  setDraft({ search: "", when: "all", from: "", to: "" })
                }
                className="ml-auto text-sm font-semibold text-govt-green hover:underline"
              >
                {t.eventsPage.clearFilters}
              </button>
            ) : null}
          </div>
        </form>

        {/* Dim while a debounced filter change is being applied, so the list
            visibly belongs to the previous query until the new one lands. */}
        <div
          className={
            isPending ? "opacity-50 transition-opacity" : "transition-opacity"
          }
        >
        {events.length > 0 ? (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {toLocaleDigits(total, lang)} {t.eventsPage.count}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination (a backend filter: links into ?page=) */}
            {totalPages > 1 ? (
              <nav
                aria-label={t.eventsPage.pageWord}
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
              >
                {page > 1 ? (
                  <Link
                    href={href(filters, page - 1)}
                    aria-label={t.eventsPage.prev}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-govt-green hover:text-govt-green"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Link>
                ) : null}
                {pageNumbers(page, totalPages).map((p, index) =>
                  p === null ? (
                    <span
                      key={`gap-${index}`}
                      className="px-1 text-sm text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={href(filters, p)}
                      aria-current={p === page ? "page" : undefined}
                      className={`inline-flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                        p === page
                          ? "border-govt-green bg-govt-green text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:border-govt-green hover:text-govt-green"
                      }`}
                    >
                      {toLocaleDigits(p, lang)}
                    </Link>
                  ),
                )}
                {page < totalPages ? (
                  <Link
                    href={href(filters, page + 1)}
                    aria-label={t.eventsPage.next}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-govt-green hover:text-govt-green"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {isFiltered ? t.eventsPage.noResults : t.eventsPage.empty}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
