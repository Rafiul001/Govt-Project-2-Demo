import { Button, Chip } from "@heroui/react";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { displayTitle } from "../../lib/displayTitle";
import type { TMember } from "../../types";

type TMemberCardProps = {
  member: TMember;
  /** Display label of the member's category (e.g. "খেলোয়াড় • Players"). */
  categoryLabel: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** GEMS-style profile tile for a member (player/coach/official/…). */
export function MemberCard({
  member,
  categoryLabel,
  onView,
  onEdit,
  onDelete,
}: TMemberCardProps) {
  const name = displayTitle(member.nameBn, member.nameEn);

  return (
    <div className="group relative flex overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
      {/* Left accent bar */}
      <div className="w-1.5 shrink-0 bg-accent" />

      {/* Photo */}
      <div className="relative w-2/5 shrink-0 overflow-hidden bg-surface-tertiary">
        {member.photo ? (
          <img
            src={member.photo}
            alt={name}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent text-4xl font-bold text-accent-foreground">
            {(member.nameBn ?? member.nameEn ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center gap-1 border-l-2 border-accent px-5 py-12">
        {/* Triangle pointer */}
        <span className="absolute -left-2 top-6 size-0 border-y-8 border-r-8 border-y-transparent border-r-accent" />

        <Chip size="sm" className="w-fit">
          {categoryLabel}
        </Chip>
        <h3 className="text-lg font-bold leading-tight text-foreground">
          {name}
        </h3>
        {member.designation ? (
          <p className="font-semibold text-accent">{member.designation}</p>
        ) : null}
        {member.discipline || member.jerseyNumber != null ? (
          <p className="text-sm text-muted">
            {[
              member.discipline,
              member.jerseyNumber != null ? `#${member.jerseyNumber}` : null,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted">Display order #{member.order}</p>
      </div>

      {/* Floating action buttons */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border bg-surface-secondary/85 p-1 opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="View profile"
          className="size-8 min-w-8 rounded-full border-0 bg-transparent text-muted hover:bg-surface-tertiary hover:text-foreground"
          onPress={onView}
        >
          <EyeIcon className="size-4" strokeWidth={2.25} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Edit"
          className="size-8 min-w-8 rounded-full border-0 bg-transparent text-muted hover:bg-surface-tertiary hover:text-foreground"
          onPress={onEdit}
        >
          <PencilIcon className="size-4" strokeWidth={2.25} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Delete"
          className="size-8 min-w-8 rounded-full border-0 bg-transparent text-red-500 hover:bg-red-500/15"
          onPress={onDelete}
        >
          <TrashIcon className="size-4" strokeWidth={2.25} />
        </Button>
      </div>
    </div>
  );
}
