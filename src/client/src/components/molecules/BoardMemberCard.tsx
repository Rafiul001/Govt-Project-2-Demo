import { Button } from "@heroui/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { TBoardOfDirector } from "../../types";

type BoardMemberCardProps = {
  member: TBoardOfDirector;
  onEdit: () => void;
  onDelete: () => void;
};

/** Horizontal profile tile for a board member. */
export function BoardMemberCard({
  member,
  onEdit,
  onDelete,
}: BoardMemberCardProps) {
  return (
    <div className="group relative flex overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
      {/* Left accent bar */}
      <div className="w-1.5 shrink-0 bg-accent" />

      {/* Photo */}
      <div className="relative w-1/2 shrink-0 overflow-hidden bg-surface-tertiary">
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent text-4xl font-bold text-accent-foreground">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center gap-1 border-l-2 border-accent px-6 py-15">
        {/* Triangle pointer */}
        <span className="absolute -left-2 top-6 size-0 border-y-8 border-r-8 border-y-transparent border-r-accent" />

        <h3 className="text-xl font-bold leading-tight text-foreground">
          {member.name}
        </h3>
        <p className="font-semibold text-accent">{member.designation}</p>
        <p className="mt-1 text-xs text-muted">Display order #{member.order}</p>
      </div>

      {/* Floating action buttons */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border bg-surface-secondary/85 p-1 opacity-0 shadow-md backdrop-blur-md transition-opacity group-hover:opacity-100">
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
