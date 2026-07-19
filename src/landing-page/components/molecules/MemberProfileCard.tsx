"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pickLang } from "@/lib/i18n";
import type { TMember } from "@/lib/types";
import Image from "next/image";

/**
 * Public profile tile for a member (player, coach, official, …), following
 * `DirectorCard`'s vertical government-portal layout with the sports details
 * federation sites show (discipline, jersey number).
 */
export function MemberProfileCard({ member }: { member: TMember }) {
  const { lang } = useLanguage();
  const name = pickLang(lang, member.nameBn, member.nameEn);
  const detailLine = [
    member.discipline,
    member.jerseyNumber != null ? `#${member.jerseyNumber}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-sm transition-shadow hover:shadow-md">
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
        <h3 className="font-bold leading-tight text-slate-800">{name}</h3>
        {member.designation ? (
          <p className="mt-1 text-sm font-medium text-govt-red">
            {member.designation}
          </p>
        ) : null}
        {detailLine ? (
          <p className="mt-1 text-xs text-slate-500">{detailLine}</p>
        ) : null}
      </div>
    </article>
  );
}
