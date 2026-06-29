import { Button } from "@heroui/react";
import {
  CheckIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelsTopLeftIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import type { TLayout } from "../../types";

type TLayoutCardProps = {
  layout: TLayout;
  branchName?: string;
  onEdit: () => void;
  onDelete: () => void;
};

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-tertiary px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      {enabled ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-accent">
          <CheckIcon className="size-3.5" /> On
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-semibold text-muted">
          <XIcon className="size-3.5" /> Off
        </span>
      )}
    </div>
  );
}

/** Card summarising a branch's display/layout settings. */
export function LayoutCard({
  layout,
  branchName,
  onEdit,
  onDelete,
}: TLayoutCardProps) {
  const SidebarIcon =
    layout.sidebarPosition === "left" ? PanelLeftIcon : PanelRightIcon;

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-surface-secondary p-5 shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
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

      <div className="flex items-center gap-3 pr-16">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <PanelsTopLeftIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">
            {branchName ?? `Branch #${layout.branchId}`}
          </h3>
          <p className="text-sm text-muted">Display settings</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <FeatureRow label="Show logo" enabled={layout.showLogo} />
        <FeatureRow label="Show banner" enabled={layout.showBanner} />
        <div className="flex items-center justify-between rounded-lg bg-surface-tertiary px-3 py-2">
          <span className="text-sm text-foreground">Sidebar</span>
          <span className="flex items-center gap-1 text-xs font-semibold capitalize text-foreground">
            <SidebarIcon className="size-3.5" /> {layout.sidebarPosition}
          </span>
        </div>
      </div>
    </div>
  );
}
