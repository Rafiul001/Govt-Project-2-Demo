"use client";

import { MemberProfileCard } from "@/components/molecules/MemberProfileCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { toLocaleDigits } from "@/lib/format";
import { pickLang, withBranch } from "@/lib/i18n";
import type { TMember, TMemberCategory } from "@/lib/types";
import Link from "next/link";

/**
 * All members of one category (the `/members/:slug` route), ordered by
 * display `order` — the category's own bilingual name is the page heading.
 */
export function MembersArchive({
  category,
  members,
  branchName,
}: {
  category: TMemberCategory;
  members: TMember[];
  branchName?: string | null;
}) {
  const { lang, t } = useLanguage();
  const ordered = [...members].sort((a, b) => a.order - b.order);

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.membersPage.backHome}
        </Link>

        <div className="mt-4">
          <SectionHeading
            title={pickLang(lang, category.nameBn, category.nameEn)}
            subtitle={withBranch(t.membersPage.subtitle, branchName)}
          />
        </div>

        {ordered.length > 0 ? (
          <>
            <p className="mt-6 text-sm text-slate-500">
              {toLocaleDigits(ordered.length, lang)} {t.membersPage.count}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {ordered.map((member) => (
                <MemberProfileCard key={member.id} member={member} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.membersPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
