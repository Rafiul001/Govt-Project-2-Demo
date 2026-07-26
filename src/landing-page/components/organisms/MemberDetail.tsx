"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocaleDate, toLocaleDigits } from "@/lib/format";
import { pickLang } from "@/lib/i18n";
import type { TMember, TMemberCategory } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

/**
 * One label/value line. Renders nothing when the value is empty — which is
 * also how an *unpublished* field arrives, since the API blanks anything the
 * admin has not opted into. The site therefore never has to know the privacy
 * rules: it simply shows what it was given.
 */
function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-3 py-2">
      <dt className="w-36 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/** A titled group of rows; hidden entirely when every row is empty. */
function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const rows = Array.isArray(children) ? children : [children];
  const hasContent = rows.some(Boolean);
  if (!hasContent) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wide text-govt-green">
        {title}
      </h3>
      <dl className="mt-2 divide-y divide-slate-100">{children}</dl>
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

  const contactRows = [
    <ProfileRow
      key="mobile"
      label={t.memberPage.mobile}
      value={member.mobile}
    />,
    <ProfileRow key="email" label={t.memberPage.email} value={member.email} />,
  ];
  const personalRows = [
    <ProfileRow
      key="dob"
      label={t.memberPage.dateOfBirth}
      value={
        member.dateOfBirth ? formatLocaleDate(member.dateOfBirth, lang) : null
      }
    />,
    <ProfileRow
      key="blood"
      label={t.memberPage.bloodGroup}
      value={member.bloodGroup}
    />,
    <ProfileRow
      key="gender"
      label={t.memberPage.gender}
      value={member.gender}
    />,
    <ProfileRow key="nid" label={t.memberPage.nid} value={member.nid} />,
    <ProfileRow
      key="address"
      label={t.memberPage.address}
      value={member.address}
    />,
  ];
  const sportsRows = [
    <ProfileRow
      key="discipline"
      label={t.memberPage.discipline}
      value={member.discipline}
    />,
    <ProfileRow
      key="jersey"
      label={t.memberPage.jerseyNumber}
      value={
        member.jerseyNumber != null
          ? toLocaleDigits(member.jerseyNumber, lang)
          : null
      }
    />,
    <ProfileRow
      key="joining"
      label={t.memberPage.joiningDate}
      value={
        member.joiningDate ? formatLocaleDate(member.joiningDate, lang) : null
      }
    />,
    <ProfileRow
      key="achievements"
      label={t.memberPage.achievements}
      value={member.achievements}
    />,
    <ProfileRow key="bio" label={t.memberPage.bio} value={member.bio} />,
  ];

  // `ProfileRow` returns null for an empty value, so this is exactly "did the
  // admin publish anything at all beyond the identity header?".
  const hasDetails = [...contactRows, ...personalRows, ...sportsRows].some(
    (row) => row.props.value != null && row.props.value !== "",
  );

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
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <ProfileSection title={t.memberPage.contact}>
              {contactRows}
            </ProfileSection>
            <ProfileSection title={t.memberPage.personal}>
              {personalRows}
            </ProfileSection>
            <div className="lg:col-span-2">
              <ProfileSection title={t.memberPage.sports}>
                {sportsRows}
              </ProfileSection>
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
