"use client";

import { DirectorCard } from "@/components/molecules/DirectorCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { toLocaleDigits } from "@/lib/format";
import type { TBoardOfDirector } from "@/lib/types";
import Link from "next/link";

/** Full board of directors (the `/board` route), ordered by display `order`. */
export function BoardArchive({ members }: { members: TBoardOfDirector[] }) {
  const { lang, t } = useLanguage();
  const ordered = [...members].sort((a, b) => a.order - b.order);

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.boardPage.backHome}
        </Link>

        <div className="mt-4">
          <SectionHeading
            title={t.boardPage.heading}
            subtitle={t.boardPage.subtitle}
          />
        </div>

        {ordered.length > 0 ? (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {toLocaleDigits(ordered.length, lang)} {t.boardPage.count}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {ordered.map((member) => (
                <DirectorCard key={member.id} member={member} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.boardPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
