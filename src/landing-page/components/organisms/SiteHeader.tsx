"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { dictionaries } from "@/lib/i18n";
import type { TBranch } from "@/lib/types";
import Image from "next/image";

/**
 * Masthead: national emblem on the left, the *branch* name as the headline in
 * the centre with the parent organization as its subtitle, and the branch's
 * own logo (falling back to the national flag) on the right — the standard
 * Bangladesh government portal header composition.
 *
 * The branch leads because every deployment of this site *is* one branch's
 * site; the organization is the context, not the subject.
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
            {branch
              ? `${branch.name} ${t.header.branchSuffix}`
              : t.org.name}
          </h1>
          {/* The organization is the subtitle now that the branch is the
              headline. Shown only when there *is* a branch above it. */}
          {branch ? (
            <p className="truncate text-sm font-semibold text-govt-red sm:text-base">
              {t.org.name}
            </p>
          ) : null}
          {/* Third line repeats the identity in English when the page is in
              Bangla; redundant when the page is already in English. */}
          {lang === "bn" ? (
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              {branch
                ? `${branch.name} ${dictionaries.en.header.branchSuffix}, ${dictionaries.en.org.name}`
                : dictionaries.en.org.name}
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
