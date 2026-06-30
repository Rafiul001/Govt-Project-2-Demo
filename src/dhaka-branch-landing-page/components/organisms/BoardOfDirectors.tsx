"use client";

import { DirectorCard } from "@/components/molecules/DirectorCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TBoardOfDirector } from "@/lib/types";

/** Officials / board-of-directors grid, ordered by display `order`. */
export function BoardOfDirectors({ members }: { members: TBoardOfDirector[] }) {
  const { t } = useLanguage();
  const ordered = [...members].sort((a, b) => a.order - b.order);

  return (
    <section id="board" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title={t.board.title}
          subtitle={t.board.subtitle}
          align="center"
        />

        {ordered.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ordered.map((member) => (
              <DirectorCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-slate-500">
            {t.board.empty}
          </p>
        )}
      </div>
    </section>
  );
}
