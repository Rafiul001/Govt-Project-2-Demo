import { Avatar, Button, Chip } from "@heroui/react";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { TAdmin } from "../../types";

type TAdminCardProps = {
  admin: TAdmin;
  branchName?: string;
  onEdit: () => void;
  onDelete: () => void;
};

/** Profile card for a portal administrator. */
export function AdminCard({
  admin,
  branchName,
  onEdit,
  onDelete,
}: TAdminCardProps) {
  // Super admins are seeded and cannot be edited/deleted in the panel.
  const isSuperAdmin = admin.adminType === "SUPER_ADMIN";

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-surface-secondary p-5 shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
      {!isSuperAdmin && (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Edit"
            className="rounded-full text-muted hover:bg-surface-tertiary hover:text-foreground"
            onPress={onEdit}
          >
            <PencilIcon className="size-4" strokeWidth={2.25} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Delete"
            className="rounded-full text-red-500 hover:bg-red-500/15"
            onPress={onDelete}
          >
            <TrashIcon className="size-4" strokeWidth={2.25} />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4 pr-16">
        <Avatar className="size-14 shrink-0">
          <Avatar.Image src={admin.avatar} alt={admin.name} />
          <Avatar.Fallback className="bg-accent font-semibold text-accent-foreground">
            {admin.name.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">
            {admin.name}
          </h3>
          <p className="truncate text-sm text-muted">@{admin.username}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <Chip
          color={isSuperAdmin ? "accent" : "default"}
          variant="soft"
          size="sm"
        >
          {isSuperAdmin ? "Super Admin" : "Branch Admin"}
        </Chip>
        <span className="truncate text-sm text-muted">
          {isSuperAdmin
            ? "All branches"
            : (branchName ??
              (admin.branchId ? `Branch #${admin.branchId}` : "—"))}
        </span>
      </div>
    </div>
  );
}
