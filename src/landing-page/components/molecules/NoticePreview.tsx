"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate } from "@/lib/format";
import type { TNotice } from "@/lib/types";
import { CalendarDays, Download, FileText } from "lucide-react";
import Image from "next/image";

/** Whether an attachment URL points at a PDF (ignoring any query string). */
function isPdf(url: string): boolean {
  return /\.pdf(?:$|\?|#)/i.test(url);
}

/**
 * Full preview of a single notice — the detail pane on the left of the
 * `/notices` archive. Shows the notice image, complete description, publish
 * date, an inline preview of the attached PDF (when one exists), and a
 * download link for whichever notice is selected in the list.
 */
export function NoticePreview({ notice }: { notice: TNotice }) {
  const { lang, t } = useLanguage();

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Notice image, or an icon placeholder */}
      <div className="relative aspect-video w-full bg-govt-green/5">
        {notice.image ? (
          <Image
            src={notice.image}
            alt={notice.title}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-govt-green/40">
            <FileText className="size-16" aria-hidden />
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold leading-snug text-slate-800">
          {notice.title}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            <time dateTime={notice.createdAt}>
              {t.notices.publishedOn}:{" "}
              {formatLocaleDate(notice.createdAt, lang)}
            </time>
          </span>
          {notice.fileUrl ? (
            <a
              href={notice.fileUrl}
              className="inline-flex items-center gap-1.5 font-medium text-govt-red hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="size-3.5" aria-hidden />
              {t.notices.download}
            </a>
          ) : null}
        </div>

        {notice.description ? (
          <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">
            {notice.description}
          </p>
        ) : null}

        {notice.fileUrl && isPdf(notice.fileUrl) ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <iframe
              title={notice.title}
              src={`${notice.fileUrl}#view=FitH`}
              className="h-160 w-full"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
