"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate } from "@/lib/format";
import type { TNotice } from "@/lib/types";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

/**
 * Notice-board row — mirrors the inbox-style `NoticeCard` from the admin client
 * (`src/client/.../molecules/NoticeCard.tsx`) but read-only for public viewing.
 *
 * The whole row is a "stretched link" to the `/notices` archive with the notice
 * pre-selected; the download link sits above it so it stays independently
 * clickable (anchors can't be nested).
 */
export function NoticeItem({ notice }: { notice: TNotice }) {
  const { lang, t } = useLanguage();

  return (
    <article className="group relative flex gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <Link
        href={`/notices?id=${notice.id}`}
        aria-label={notice.title}
        className="absolute inset-0 z-0"
      />

      <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-govt-green/10 text-govt-green">
        <FileText className="size-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug text-slate-800 transition-colors group-hover:text-govt-green">
          {notice.title}
        </h3>
        {notice.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {notice.description}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <time dateTime={notice.createdAt}>
            {t.notices.publishedOn}: {formatLocaleDate(notice.createdAt, lang)}
          </time>
          {notice.fileUrl ? (
            <a
              href={notice.fileUrl}
              className="relative z-10 inline-flex items-center gap-1 font-medium text-govt-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="size-3.5" aria-hidden />
              {t.notices.download}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
