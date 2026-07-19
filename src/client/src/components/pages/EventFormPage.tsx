import { Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useEvent } from "../../hooks/useEvents";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import { ErrorState, LoadingState, PageHeader } from "../molecules";
import { EventForm } from "../organisms";

/** Search params of the events list to return to after saving/cancelling. */
const EVENTS_LIST_SEARCH = { page: 1, pageSize: 10, view: "list" } as const;

/**
 * Full-page event editor (`/event/new`, `/event/:id/edit`). Loads the event
 * when editing and returns to the events list when done.
 */
export function EventFormPage({
  id,
}: {
  /** Event id when editing; omit to create. */
  id?: number;
}) {
  const isEdit = id !== undefined;
  const eventQuery = useEvent(id ?? NaN);
  const navigate = useNavigate();
  const goBack = () => navigate({ to: "/events", search: EVENTS_LIST_SEARCH });

  if (isEdit && eventQuery.isLoading) return <LoadingState />;
  if (isEdit && (eventQuery.isError || !eventQuery.data)) {
    return <ErrorState message={getApiErrorMessage(eventQuery.error)} />;
  }
  const event = isEdit ? eventQuery.data : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={
          isEdit
            ? `Edit event — ${displayTitle(event?.titleBn, event?.titleEn)}`
            : "Add event"
        }
        description="Shown in the events list and calendar on the public site once published."
        actions={
          <Button variant="ghost" onPress={goBack}>
            <ArrowLeftIcon className="size-4" />
            Back to events
          </Button>
        }
      />
      <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-(--card-shadow)">
        <EventForm initial={event} onSuccess={goBack} onCancel={goBack} />
      </div>
    </div>
  );
}
