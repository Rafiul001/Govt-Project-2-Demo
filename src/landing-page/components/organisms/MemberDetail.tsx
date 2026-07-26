"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toLocaleDigits } from "@/lib/format";
import { pickLang } from "@/lib/i18n";
import type { TMember, TMemberCategory } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

/**
 * One label/value line of a profile group.
 *
 * An empty value is also how an *unpublished* field arrives, since the API
 * blanks anything the admin has not opted into. The site therefore never has
 * to know the privacy rules: it simply shows what it was given.
 */
type TProfileRow = { label: string; value: string | number | null | undefined };

/** Rows that actually carry a value — i.e. the ones this member publishes. */
function filled(rows: TProfileRow[]): TProfileRow[] {
  return rows.filter((row) => row.value != null && row.value !== "");
}

/**
 * A titled group of rows, hidden entirely when the member publishes none of
 * them.
 *
 * Note this takes row *data*, not `<ProfileRow>` elements: a React element is
 * a truthy object even when it renders `null`, so filtering elements would
 * leave an empty bordered panel on the page.
 */
function ProfileSection({ title, rows }: { title: string; rows: TProfileRow[] }) {
  const visible = filled(rows);
  if (visible.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-govt-green">
        {title}
      </h3>
      <dl className="mt-2 divide-y divide-slate-100">
        {visible.map((row) => (
          <div key={row.label} className="flex gap-3 py-2">
            <dt className="w-36 shrink-0 text-sm text-slate-500">
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-slate-800">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Public profile page of one member (`/members/:categorySlug/:id`), reached by
 * clicking a profile card in the category listing.
 *
 * Every optional field here is published per member from the dashboard's
 * "Public profile" section; anything not published comes back `null` from the
 * API and its row (and, if it empties a whole group, that group) disappears.
 */
export function MemberDetail({
  member,
  category,
}: {
  member: TMember;
  category: TMemberCategory;
}) {
  const { lang, t } = useLanguage();
  const name = pickLang(lang, member.nameBn, member.nameEn);
  const categoryName = pickLang(lang, category.nameBn, category.nameEn);

  const contactRows: TProfileRow[] = [
    { label: t.memberPage.mobile, value: member.mobile },
    { label: t.memberPage.email, value: member.email },
  ];
  const personalRows: TProfileRow[] = [
    {
      label: t.memberPage.dateOfBirth,
      value: member.dateOfBirth
        ? formatLocaleDate(member.dateOfBirth, lang)
        : null,
    },
    { label: t.memberPage.bloodGroup, value: member.bloodGroup },
    { label: t.memberPage.gender, value: member.gender },
    { label: t.memberPage.nid, value: member.nid },
    { label: t.memberPage.address, value: member.address },
  ];
  const sportsRows: TProfileRow[] = [
    { label: t.memberPage.discipline, value: member.discipline },
    {
      label: t.memberPage.jerseyNumber,
      value:
        member.jerseyNumber != null
          ? toLocaleDigits(member.jerseyNumber, lang)
          : null,
    },
    {
      label: t.memberPage.joiningDate,
      value: member.joiningDate
        ? formatLocaleDate(member.joiningDate, lang)
        : null,
    },
    { label: t.memberPage.achievements, value: member.achievements },
    { label: t.memberPage.bio, value: member.bio },
  ];

  // "Did this member publish anything at all beyond the identity header?"
  const hasDetails =
    filled([...contactRows, ...personalRows, ...sportsRows]).length > 0;

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-5xl px-4">
        <Link
          href={`/members/${encodeURIComponent(category.slug)}`}
          className="text-sm font-semibold text-govt-green hover:underline"
        >
          {t.memberPage.backToCategory}
        </Link>

        <div className="mt-4">
          <SectionHeading title={t.memberPage.heading} />
        </div>

        {/* Identity header — always public */}
        <div className="mt-8 flex flex-col items-center gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
          <div className="relative size-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={name}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-govt-green/10 text-6xl font-bold text-govt-green">
                {name.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
            {member.designation ? (
              <p className="mt-1 font-semibold text-govt-red">
                {member.designation}
              </p>
            ) : null}
            <span className="mt-3 inline-block rounded-full bg-govt-green/10 px-3 py-1 text-sm font-medium text-govt-green">
              {categoryName}
            </span>
          </div>
        </div>

        {hasDetails ? (
          <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
            <ProfileSection title={t.memberPage.contact} rows={contactRows} />
            <ProfileSection title={t.memberPage.personal} rows={personalRows} />
            <div className="lg:col-span-2">
              <ProfileSection title={t.memberPage.sports} rows={sportsRows} />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.memberPage.empty}
          </div>
        )}
      </div>
    </section>
  );
}
