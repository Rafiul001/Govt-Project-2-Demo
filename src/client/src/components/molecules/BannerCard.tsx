import { Button } from "@heroui/react";
import { ImageIcon, PencilIcon, TrashIcon } from "lucide-react";
import type { TBanner } from "../../types";

type TBannerCardProps = {
  banner: TBanner;
  onEdit: () => void;
  onDelete: () => void;
};

/** Landscape preview tile for a hero banner slide. */
export function BannerCard({ banner, onEdit, onDelete }: TBannerCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
      {/* Banner image */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-tertiary">
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent/15 text-accent">
            <ImageIcon className="size-10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-lg font-bold leading-tight text-foreground">
            {banner.title}
          </h3>
          <span className="shrink-0 text-xs text-muted">#{banner.order}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted">{banner.subTitle}</p>
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
