"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, formatLocaleTime } from "@/lib/format";
import { pickLang } from "@/lib/i18n";
import type { TEvent } from "@/lib/types";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** One labelled fact of the event's summary panel. */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-govt-green">{icon}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </dt>
        <dd className="text-sm text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

/**
 * Full detail view of a single published event (`/events/:id`), reached by
 * clicking an event anywhere on the site — the archive cards, the calendar
 * chips, or the home page's upcoming list.
 */
export function EventDetail({ event }: { event: TEvent }) {
  const { lang, t } = useLanguage();
  const title = pickLang(lang, event.titleBn, event.titleEn);
  const description = pickLang(lang, event.descriptionBn, event.descriptionEn);

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          href="/events"
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.eventPage.backToEvents}
        </Link>

        <div className="mt-4">
          <SectionHeading title={title} />
        </div>

        {event.image ? (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
            <Image
              src={event.image}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <dl className="mt-8 grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <DetailRow
            icon={<CalendarDays className="size-5" aria-hidden />}
            label={t.eventPage.starts}
            value={`${formatLocaleDate(event.startAt, lang)}, ${formatLocaleTime(event.startAt, lang)}`}
          />
          {event.endAt ? (
            <DetailRow
              icon={<CalendarDays className="size-5" aria-hidden />}
              label={t.eventPage.ends}
              value={`${formatLocaleDate(event.endAt, lang)}, ${formatLocaleTime(event.endAt, lang)}`}
            />
          ) : null}
          {event.venue ? (
            <DetailRow
              icon={<MapPin className="size-5" aria-hidden />}
              label={t.eventPage.venue}
              value={event.venue}
            />
          ) : null}
        </dl>

        {description ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {/* Descriptions are plain text; keep the admin's line breaks. */}
            <p className="whitespace-pre-line leading-relaxed text-slate-700">
              {description}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
