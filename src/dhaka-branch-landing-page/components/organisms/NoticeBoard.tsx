"use client";

import { NoticeItem } from "@/components/molecules/NoticeItem";
import { QuickLink } from "@/components/molecules/QuickLink";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { importantLinks } from "@/lib/data";
import type { TNotice } from "@/lib/types";
import Link from "next/link";

/** Notices shown on the home page; the rest live on the `/notices` archive. */
const HOME_NOTICE_LIMIT = 4;

/**
 * Notice board + important links — the two-column centrepiece of nearly every
 * Bangladesh govt portal. Notices come from the API (already published-only).
 */
export function NoticeBoard({ notices }: { notices: TNotice[] }) {
  const { lang, t } = useLanguage();
  // Surface only the latest few here; "view all" leads to the full archive.
  const latest = notices
    .filter((n) => n.isPublished)
    .slice(0, HOME_NOTICE_LIMIT);

  return (
    <section id="notices" className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
        {/* Notices */}
        <div className="lg:col-span-2">
          <SectionHeading title={t.notices.title} />
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-2 shadow-sm">
            {latest.length > 0 ? (
              latest.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                {t.notices.empty}
              </p>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/notices"
              className="text-sm font-semibold text-govt-green hover:underline"
            >
              {t.notices.viewAll}
            </Link>
          </div>
        </div>

        {/* Important links */}
        <aside>
          <SectionHeading title={t.notices.importantLinks} />
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            {importantLinks.map((link) => (
              <QuickLink
                key={link.href}
                label={lang === "bn" ? link.labelBn : link.labelEn}
                href={link.href}
              />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
