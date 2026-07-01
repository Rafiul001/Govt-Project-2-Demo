import { Chip } from "@heroui/react";
import { FileTextIcon, ImageIcon, MegaphoneIcon } from "lucide-react";
import type { TNotice } from "../../types";

type TNoticeCardProps = {
  notice: TNotice;
  isSelected: boolean;
  onSelect: () => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Inbox-style row for the notices list; selecting it opens the preview. */
export function NoticeCard({ notice, isSelected, onSelect }: TNoticeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`group flex w-full gap-3 rounded-xl border p-3 text-left transition-colors ${
        isSelected
          ? "border-accent bg-accent/10 ring-1 ring-accent"
          : "border-border bg-surface-secondary hover:border-accent/50 hover:bg-surface-tertiary"
      }`}
    >
      {/* Thumbnail */}
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary">
        {notice.image ? (
          <img src={notice.image} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent/15 text-accent">
            <MegaphoneIcon className="size-6" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-tight text-foreground">
            {notice.title}
          </h3>
          <Chip
            color={notice.isPublished ? "success" : "default"}
            variant="soft"
            size="sm"
          >
            {notice.isPublished ? "Published" : "Draft"}
          </Chip>
        </div>
        <p className="line-clamp-2 text-sm text-muted">
          {notice.description || "No description provided."}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted">
          <span>{formatDate(notice.createdAt)}</span>
          {notice.image && <ImageIcon className="size-3.5" />}
          {notice.fileUrl && <FileTextIcon className="size-3.5" />}
        </div>
      </div>
    </button>
  );
}
