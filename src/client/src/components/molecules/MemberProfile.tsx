import { Chip } from "@heroui/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { displayTitle } from "../../lib/displayTitle";
import type { TMember } from "../../types";
import {
  defaultMemberPublicFieldValues,
  type TMemberPublicFieldValue,
} from "../../validators";

/**
 * One label/value line of the profile; hidden when the value is empty.
 *
 * `visibility` marks whether the field is published on the landing site, so an
 * admin can see at a glance what a visitor gets. Identity fields (name,
 * designation, …) are always public and pass no marker.
 */
function ProfileRow({
  label,
  value,
  visibility,
}: {
  label: string;
  value: string | number | null | undefined;
  visibility?: boolean;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-2 text-sm">
      <dt className="flex w-32 shrink-0 items-center gap-1.5 font-medium text-muted">
        {visibility === undefined ? null : visibility ? (
          <EyeIcon className="size-3.5 text-accent" aria-label="Public" />
        ) : (
          <EyeOffIcon className="size-3.5" aria-label="Not published" />
        )}
        {label}
      </dt>
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
 * members page. Shows all three field groups; empty fields are hidden. Each
 * configurable field carries an eye marker showing whether it is published on
 * the public site (see "Public profile" in the member form).
 */
export function MemberProfile({
  member,
  categoryLabel,
  branchName,
}: TMemberProfileProps) {
  const name = displayTitle(member.nameBn, member.nameEn);
  const published = new Set<string>(
    member.publicFields ?? defaultMemberPublicFieldValues,
  );
  const isPublic = (field: TMemberPublicFieldValue) => published.has(field);

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
        <ProfileRow
          label="Mobile"
          value={member.mobile}
          visibility={isPublic("mobile")}
        />
        <ProfileRow
          label="Email"
          value={member.email}
          visibility={isPublic("email")}
        />
        <ProfileRow label="Display order" value={member.order} />
      </ProfileSection>

      <ProfileSection title="Personal information">
        <ProfileRow
          label="Date of birth"
          value={formatDate(member.dateOfBirth)}
          visibility={isPublic("dateOfBirth")}
        />
        <ProfileRow
          label="Blood group"
          value={member.bloodGroup}
          visibility={isPublic("bloodGroup")}
        />
        <ProfileRow
          label="Gender"
          value={member.gender}
          visibility={isPublic("gender")}
        />
        <ProfileRow
          label="NID"
          value={member.nid}
          visibility={isPublic("nid")}
        />
        <ProfileRow
          label="Address"
          value={member.address}
          visibility={isPublic("address")}
        />
      </ProfileSection>

      <ProfileSection title="Sports information">
        <ProfileRow
          label="Discipline"
          value={member.discipline}
          visibility={isPublic("discipline")}
        />
        <ProfileRow
          label="Jersey number"
          value={member.jerseyNumber}
          visibility={isPublic("jerseyNumber")}
        />
        <ProfileRow
          label="Joining date"
          value={formatDate(member.joiningDate)}
          visibility={isPublic("joiningDate")}
        />
        <ProfileRow
          label="Achievements"
          value={member.achievements}
          visibility={isPublic("achievements")}
        />
        <ProfileRow
          label="Bio"
          value={member.bio}
          visibility={isPublic("bio")}
        />
      </ProfileSection>
    </div>
  );
}
