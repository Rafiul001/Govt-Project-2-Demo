import { Button } from "@heroui/react";
import {
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
} from "lucide-react";
import type { TBranch } from "../../types";

type BranchCardProps = {
  branch: TBranch;
  onEdit: () => void;
  onDelete: () => void;
};

/** Branch tile with banner, overlapping logo, and contact details. */
export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-secondary shadow-(--card-shadow) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--card-shadow-hover)">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        {branch.banner ? (
          <img
            src={branch.banner}
            alt={branch.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-accent" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

        {/* Floating action buttons */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-white/20 bg-black/30 p-1 shadow-lg backdrop-blur-md">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Edit"
            className="size-8 min-w-8 rounded-full border-0 bg-transparent text-white hover:bg-white/20"
            onPress={onEdit}
          >
            <PencilIcon className="size-4" strokeWidth={2.25} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Delete"
            className="size-8 min-w-8 rounded-full border-0 bg-transparent text-red-400 hover:bg-red-500/30 hover:text-red-200"
            onPress={onDelete}
          >
            <TrashIcon className="size-4" strokeWidth={2.25} />
          </Button>
        </div>
      </div>

      {/* Overlapping logo */}
      <div className="relative -mt-9 px-5">
        {branch.logo ? (
          <img
            src={branch.logo}
            alt={`${branch.name} logo`}
            className="size-18 rounded-2xl border-4 border-surface-secondary bg-surface-secondary object-cover shadow-md"
          />
        ) : (
          <div className="flex size-18 items-center justify-center rounded-2xl border-4 border-surface-secondary bg-accent text-2xl font-bold text-accent-foreground shadow-md">
            {branch.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-3">
        <div className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-accent" />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold leading-tight text-foreground">
              {branch.name}
            </h3>
            <p className="line-clamp-2 text-sm text-muted">{branch.address}</p>
          </div>
        </div>

        {(branch.phone || branch.email) && (
          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3 text-sm">
            {branch.phone && (
              <div className="flex items-center gap-2 text-foreground">
                <PhoneIcon className="size-4 shrink-0 text-muted" />
                <span className="truncate">{branch.phone}</span>
              </div>
            )}
            {branch.email && (
              <div className="flex items-center gap-2 text-foreground">
                <MailIcon className="size-4 shrink-0 text-muted" />
                <span className="truncate">{branch.email}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
