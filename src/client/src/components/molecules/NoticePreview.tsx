import { Button, Chip } from "@heroui/react";
import {
  CalendarIcon,
  ExternalLinkIcon,
  FileTextIcon,
  InboxIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import type { TNotice } from "../../types";

type TNoticePreviewProps = {
  notice: TNotice | null;
  onEdit: () => void;
  onDelete: () => void;
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Detail panel showing the full content of the selected notice. */
export function NoticePreview({
  notice,
  onEdit,
  onDelete,
}: TNoticePreviewProps) {
  if (!notice) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-secondary/50 p-10 text-center lg:h-full">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface-tertiary text-muted">
          <InboxIcon className="size-7" />
        </div>
        <div>
          <p className="font-medium text-foreground">No notice selected</p>
          <p className="text-sm text-muted">
            Select a notice from the list to preview it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-secondary shadow-(--card-shadow) lg:h-full">
      {/* Header actions */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-4">
        <Chip
          color={notice.isPublished ? "success" : "default"}
          variant="soft"
          size="sm"
        >
          {notice.isPublished ? "Published" : "Draft"}
        </Chip>
        <div className="flex items-center gap-1">
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
      </div>

      <div className="flex flex-col gap-4 p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {notice.image && (
          <img
            src={notice.image}
            alt={notice.title}
            className="max-h-72 w-full rounded-xl object-cover"
          />
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold leading-tight text-foreground">
            {notice.title}
          </h2>
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarIcon className="size-4" />
            <span>{formatDateTime(notice.createdAt)}</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {notice.description || "No description provided."}
        </p>

        {notice.fileUrl && (
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileTextIcon className="size-4 text-accent" />
                Attachment
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted hover:text-foreground"
                onPress={() =>
                  window.open(notice.fileUrl ?? "", "_blank", "noopener")
                }
              >
                <ExternalLinkIcon className="size-4" />
                Open in new tab
              </Button>
            </div>
            <iframe
              src={notice.fileUrl}
              title={`${notice.title} attachment`}
              className="min-h-200 h-full w-full rounded-xl border border-border bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
