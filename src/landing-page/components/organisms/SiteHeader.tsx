"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { dictionaries } from "@/lib/i18n";
import type { TBranch } from "@/lib/types";
import Image from "next/image";

/**
 * Masthead: national emblem on the left, organization + branch name in the
 * centre, and the branch's own logo (falling back to the national flag) on the
 * right — the standard Bangladesh government portal header composition.
 */
export function SiteHeader({ branch }: { branch: TBranch | null }) {
  const { lang, t } = useLanguage();

  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <Image
          src="/assets/govt-seal.svg"
          alt={t.header.emblemAlt}
          width={64}
          height={64}
          className="size-14 shrink-0 sm:size-16"
          priority
        />

        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-lg font-bold text-govt-green sm:text-2xl">
            {t.org.name}
          </h1>
          {branch ? (
            <p className="truncate text-sm font-semibold text-govt-red sm:text-base">
              {branch.name} {t.header.branchSuffix}
            </p>
          ) : null}
          {/* Secondary line shows the English name as a subtitle when the page
              is in Bangla; redundant when the page is already in English. */}
          {lang === "bn" ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              {dictionaries.en.org.name}
              {branch
                ? `, ${branch.name} ${dictionaries.en.header.branchSuffix}`
                : ""}
            </p>
          ) : null}
        </div>

        {branch?.logo ? (
          <Image
            src={branch.logo}
            alt={`${branch.name} logo`}
            width={64}
            height={64}
            className="hidden size-14 shrink-0 rounded-sm border border-slate-200 object-cover sm:block sm:size-16"
          />
        ) : (
          <Image
            src="/assets/flag.svg"
            alt={t.header.flagAlt}
            width={64}
            height={40}
            className="hidden h-10 w-16 shrink-0 rounded-sm border border-slate-200 object-cover sm:block"
          />
        )}
      </div>
    </header>
  );
}
