import { Chip } from "@heroui/react";
import { displayTitle } from "../../lib/displayTitle";
import type { TMember } from "../../types";

/** One label/value line of the profile; hidden when the value is empty. */
function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-2 text-sm">
      <dt className="w-32 shrink-0 font-medium text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="border-b border-border pb-1 text-sm font-semibold uppercase tracking-wide text-accent">
        {title}
      </h4>
      <dl className="space-y-1.5">{children}</dl>
    </section>
  );
}

/** `12 Apr 1998` — profile display for a date-only value. */
function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type TMemberProfileProps = {
  member: TMember;
  /** Display label of the member's category. */
  categoryLabel: string;
  /** Branch name (shown to super admins). */
  branchName?: string;
};

/**
 * Read-only GEMS-style profile view of a member, hosted in a modal from the
 * members page. Shows all three field groups; empty fields are hidden.
 */
export function MemberProfile({
  member,
  categoryLabel,
  branchName,
}: TMemberProfileProps) {
  const name = displayTitle(member.nameBn, member.nameEn);

  return (
    <div className="space-y-5">
      {/* Header: photo + identity */}
      <div className="flex items-center gap-4">
        <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-surface-tertiary">
          {member.photo ? (
            <img
              src={member.photo}
              alt={name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-accent text-3xl font-bold text-accent-foreground">
              {(member.nameBn ?? member.nameEn ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          {member.designation ? (
            <p className="font-semibold text-accent">{member.designation}</p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <Chip size="sm">{categoryLabel}</Chip>
            {branchName ? <Chip size="sm">{branchName}</Chip> : null}
          </div>
        </div>
      </div>

      <ProfileSection title="Basic information">
        <ProfileRow label="Name (Bangla)" value={member.nameBn} />
        <ProfileRow label="Name (English)" value={member.nameEn} />
        <ProfileRow label="Designation" value={member.designation} />
        <ProfileRow label="Mobile" value={member.mobile} />
        <ProfileRow label="Email" value={member.email} />
        <ProfileRow label="Display order" value={member.order} />
      </ProfileSection>

      <ProfileSection title="Personal information">
        <ProfileRow label="Date of birth" value={formatDate(member.dateOfBirth)} />
        <ProfileRow label="Blood group" value={member.bloodGroup} />
        <ProfileRow label="Gender" value={member.gender} />
        <ProfileRow label="NID" value={member.nid} />
        <ProfileRow label="Address" value={member.address} />
      </ProfileSection>

      <ProfileSection title="Sports information">
        <ProfileRow label="Discipline" value={member.discipline} />
        <ProfileRow label="Jersey number" value={member.jerseyNumber} />
        <ProfileRow label="Joining date" value={formatDate(member.joiningDate)} />
        <ProfileRow label="Achievements" value={member.achievements} />
        <ProfileRow label="Bio" value={member.bio} />
      </ProfileSection>
    </div>
  );
}
