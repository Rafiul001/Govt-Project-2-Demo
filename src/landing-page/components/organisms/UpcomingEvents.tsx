"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate } from "@/lib/format";
import { pickLang, withBranch } from "@/lib/i18n";
import type { TEvent } from "@/lib/types";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Home-page section with the branch's next few published events and a link to
 * the full `/events` calendar. Hidden entirely when there are none.
 */
export function UpcomingEvents({
  events,
  branchName,
}: {
  events: TEvent[];
  branchName?: string | null;
}) {
  const { lang, t } = useLanguage();

  if (events.length === 0) return null;

  return (
    <section id="events" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title={t.events.upcoming}
          subtitle={withBranch(t.events.subtitle, branchName)}
        />

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {events.map((event) => {
            const title = pickLang(lang, event.titleBn, event.titleEn);
            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
                <div className="border-t-4 border-govt-green px-4 py-4">
                  <h3 className="font-bold leading-tight text-slate-800">
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
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 text-right">
          <Link
            href="/events"
            className="text-sm font-semibold text-govt-green hover:underline"
          >
            {t.events.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
