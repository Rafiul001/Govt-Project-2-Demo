"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pickLang } from "@/lib/i18n";
import type { TMember } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

/**
 * Public profile tile for a member (player, coach, official, …) in a vertical
 * government-portal layout, with the sports details federation sites show
 * (discipline, jersey number) when the member publishes them.
 *
 * The whole tile links to the member's full profile page.
 */
export function MemberProfileCard({
  member,
  categorySlug,
}: {
  member: TMember;
  /** Category whose listing this card sits in — forms the profile URL. */
  categorySlug: string;
}) {
  const { lang, t } = useLanguage();
  const name = pickLang(lang, member.nameBn, member.nameEn);
  const detailLine = [
    member.discipline,
    member.jerseyNumber != null ? `#${member.jerseyNumber}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <Link
      href={`/members/${encodeURIComponent(categorySlug)}/${member.id}`}
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-slate-100">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-govt-green/10 text-5xl font-bold text-govt-green">
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="border-t-4 border-govt-green px-3 py-4">
        <h3 className="font-bold leading-tight text-slate-800 group-hover:text-govt-green">
          {name}
        </h3>
        {member.designation ? (
          <p className="mt-1 text-sm font-medium text-govt-red">
            {member.designation}
          </p>
        ) : null}
        {detailLine ? (
          <p className="mt-1 text-xs text-slate-500">{detailLine}</p>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-govt-green opacity-0 transition-opacity group-hover:opacity-100">
          {t.membersPage.viewProfile}
        </p>
      </div>
    </Link>
  );
}
