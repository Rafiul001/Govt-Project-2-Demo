"use client";

import { NoticePreview } from "@/components/molecules/NoticePreview";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toLocaleDigits } from "@/lib/format";
import type { TNotice } from "@/lib/types";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** `/notices` URL carrying the given backend filters (empty ones omitted). */
function noticesHref(search: string, page: number): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notices?${qs}` : "/notices";
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

/**
 * Full archive of published notices (the `/notices` route): a master–detail
 * split with the clickable list of notices on the left and the selected
 * notice previewed on the right. Search and pagination are backend filters —
 * both live in the query string (`?search=`, `?page=`), so submitting the
 * search box or clicking a page link re-fetches from the API. One page holds
 * 10 notices. `initialNoticeId` (from the `?id=` query) lets a notice clicked
 * elsewhere open already selected.
 */
export function NoticesArchive({
  notices,
  total,
  page,
  totalPages,
  search,
  initialNoticeId = null,
}: {
  notices: TNotice[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  initialNoticeId?: number | null;
}) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const published = notices.filter((n) => n.isPublished);

  const [selectedId, setSelectedId] = useState<number | null>(
    initialNoticeId ?? published[0]?.id ?? null,
  );
  // A stale selection (e.g. after switching page) falls back to the first
  // notice of the current page.
  const selected =
    published.find((n) => n.id === selectedId) ?? published[0] ?? null;

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("search");
    router.push(noticesHref(String(term ?? "").trim(), 1));
  };

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.noticesPage.backHome}
        </Link>

        <div className="mt-4">
          <SectionHeading
            title={t.noticesPage.heading}
            subtitle={t.noticesPage.subtitle}
          />
        </div>

        {/* Search (a backend filter: submits into the ?search= query param) */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="mt-6 flex max-w-xl items-stretch gap-2"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder={t.noticesPage.searchPlaceholder}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-govt-green focus:ring-2 focus:ring-govt-green/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-govt-green px-4 text-sm font-semibold text-white transition-colors hover:bg-govt-green/90"
          >
            {t.noticesPage.searchAction}
          </button>
        </form>

        {selected ? (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {toLocaleDigits(total, lang)} {t.noticesPage.count}
            </p>

            <div className="mt-4 grid gap-8 lg:grid-cols-3">
              {/* List — left */}
              <aside className="lg:col-span-1">
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:max-h-160 lg:overflow-y-auto">
                  {published.map((notice) => {
                    const active = notice.id === selected.id;
                    return (
                      <li key={notice.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(notice.id)}
                          aria-current={active}
                          className={`flex w-full flex-col gap-1 border-l-4 px-4 py-3 text-left transition-colors ${
                            active
                              ? "border-govt-green bg-govt-green/5"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`line-clamp-2 text-sm font-semibold ${
                              active ? "text-govt-green" : "text-slate-800"
                            }`}
                          >
                            {notice.title}
                          </span>
                          <time
                            dateTime={notice.createdAt}
                            className="text-xs text-slate-500"
                          >
                            {formatLocaleDate(notice.createdAt, lang)}
                          </time>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Pagination (a backend filter: links into ?page=) */}
                {totalPages > 1 ? (
                  <nav
                    aria-label={t.noticesPage.pageWord}
                    className="mt-4 flex flex-wrap items-center gap-1.5"
                  >
                    {page > 1 ? (
                      <Link
                        href={noticesHref(search, page - 1)}
                        aria-label={t.noticesPage.prev}
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
                          href={noticesHref(search, p)}
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
                        href={noticesHref(search, page + 1)}
                        aria-label={t.noticesPage.next}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:border-govt-green hover:text-govt-green"
                      >
                        <ChevronRight className="size-4" aria-hidden />
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </aside>

              {/* Preview (detail) — right */}
              <div className="lg:col-span-2">
                <NoticePreview notice={selected} />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {search ? t.noticesPage.noResults : t.noticesPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
