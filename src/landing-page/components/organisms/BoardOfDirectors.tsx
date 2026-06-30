"use client";

import { DirectorCard } from "@/components/molecules/DirectorCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TBoardOfDirector } from "@/lib/types";
import Link from "next/link";

/** Members shown on the home page; the rest live on the `/board` page. */
const HOME_BOARD_LIMIT = 4;

/** Officials / board-of-directors grid, ordered by display `order`. */
export function BoardOfDirectors({ members }: { members: TBoardOfDirector[] }) {
  const { t } = useLanguage();
  // Show only the first few by serial; "view all" leads to the full page.
  const ordered = [...members].sort((a, b) => a.order - b.order);
  const top = ordered.slice(0, HOME_BOARD_LIMIT);

  return (
    <section id="board" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title={t.board.title}
          subtitle={t.board.subtitle}
          align="center"
        />

        {top.length > 0 ? (
          <>
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {top.map((member) => (
                <DirectorCard key={member.id} member={member} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/board"
                className="text-sm font-semibold text-govt-green hover:underline"
              >
                {t.board.viewAll}
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-10 text-center text-sm text-slate-500">
            {t.board.empty}
          </p>
        )}
      </div>
    </section>
  );
}
