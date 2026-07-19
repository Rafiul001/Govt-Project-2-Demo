import { Button, Chip } from "@heroui/react";
import { CalendarIcon, MapPinIcon, PencilIcon, TrashIcon } from "lucide-react";
import { displayTitle } from "../../lib/displayTitle";
import type { TEvent } from "../../types";

/** `19 Jul 2026, 09:00` — dashboard display for an event timestamp. */
function formatEventDateTime(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TEventCardProps = {
  event: TEvent;
  onEdit: () => void;
  onDelete: () => void;
};

/** Card for an event: image, title, venue, schedule and publish state. */
export function EventCard({ event, onEdit, onDelete }: TEventCardProps) {
  const title = displayTitle(event.titleBn, event.titleEn);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-(--card-shadow) transition-shadow duration-300 hover:shadow-(--card-shadow-hover)">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-tertiary">
        {event.image ? (
          <img
            src={event.image}
            alt={title}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <CalendarIcon className="size-10" strokeWidth={1.5} />
          </div>
        )}
        {!event.isPublished ? (
          <Chip size="sm" className="absolute left-3 top-3">
            Draft
          </Chip>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-lg font-bold leading-tight text-foreground">
          {title}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <CalendarIcon className="size-4 shrink-0" />
          {formatEventDateTime(event.startAt)}
          {event.endAt ? ` — ${formatEventDateTime(event.endAt)}` : null}
        </p>
        {event.venue ? (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPinIcon className="size-4 shrink-0" />
            {event.venue}
          </p>
        ) : null}
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
