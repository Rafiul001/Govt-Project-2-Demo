"use client";

import { NoticePreview } from "@/components/molecules/NoticePreview";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toLocaleDigits } from "@/lib/format";
import type { TNotice } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

/**
 * Full archive of published notices (the `/notices` route): a master–detail
 * split with the selected notice previewed on the left and the clickable list
 * of all notices on the right. `initialNoticeId` (from the `?id=` query) lets a
 * notice clicked elsewhere open already selected.
 */
export function NoticesArchive({
  notices,
  initialNoticeId = null,
}: {
  notices: TNotice[];
  initialNoticeId?: number | null;
}) {
  const { lang, t } = useLanguage();
  const published = notices.filter((n) => n.isPublished);

  const [selectedId, setSelectedId] = useState<number | null>(
    initialNoticeId ?? published[0]?.id ?? null,
  );
  const selected =
    published.find((n) => n.id === selectedId) ?? published[0] ?? null;

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

        {selected ? (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {toLocaleDigits(published.length, lang)} {t.noticesPage.count}
            </p>

            <div className="mt-4 grid gap-8 lg:grid-cols-3">
              {/* Preview (detail) — left */}
              <div className="lg:col-span-2">
                <NoticePreview notice={selected} />
              </div>

              {/* List — right */}
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
              </aside>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.noticesPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
