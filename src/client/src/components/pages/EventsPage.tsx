import { Button, toast } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDaysIcon, ListIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useDeleteEvent, useEvents } from "../../hooks/useEvents";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TEvent } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  EventCard,
  LoadingState,
  PageHeader,
} from "../molecules";
import { CalendarGrid, ListFilters, TablePagination } from "../organisms";

type TEventView = "list" | "calendar";

/** `YYYY-MM` of the current month (local time). */
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** First/last day (`YYYY-MM-DD`) of a `YYYY-MM` month. */
function monthRange(month: string): { from: string; to: string } {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  const lastDay = new Date(year, monthIndex, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}

/** The month `delta` months away from `month` (`YYYY-MM`). */
function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  const shifted = new Date(year, monthIndex - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

type TEventsPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  view: TEventView;
  month?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onViewChange: (view: TEventView) => void;
  onMonthChange: (month: string) => void;
};

/**
 * Branch events as a card list or a month calendar. The calendar fetches the
 * visible month's events (overlap-matched server-side, so multi-day events
 * appear in every month they touch); clicking a chip opens the edit form.
 */
export function EventsPage({
  page,
  pageSize,
  search,
  branchName,
  view,
  month,
  onPageChange,
  onSearchChange,
  onBranchChange,
  onViewChange,
  onMonthChange,
}: TEventsPageProps) {
  const activeMonth = month ?? currentMonth();
  const { from, to } = monthRange(activeMonth);
  const [yearNum, monthNum] = activeMonth.split("-").map(Number) as [
    number,
    number,
  ];

  const query = useEvents(
    view === "calendar"
      ? { page: 1, pageSize: 100, branchName, from, to }
      : { page, pageSize, search, branchName },
  );
  const deleteMutation = useDeleteEvent();
  const navigate = useNavigate();

  // Create/edit are full pages — the bilingual event form outgrew a modal.
  const openCreate = () => navigate({ to: "/event/new" });
  const openEdit = (event: TEvent) =>
    navigate({ to: "/event/$id/edit", params: { id: String(event.id) } });

  const [deleting, setDeleting] = useState<TEvent | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Event deleted");
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const isFiltered = Boolean(search) || Boolean(branchName);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Tournaments, camps and programs shown on the public sites."
        actions={
          <Button variant="primary" onPress={openCreate}>
            <PlusIcon className="size-4" />
            Add event
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          {view === "list" ? (
            <ListFilters
              search={search}
              onSearchChange={onSearchChange}
              searchPlaceholder="Search by title or venue…"
              branchName={branchName}
              onBranchChange={onBranchChange}
            />
          ) : (
            <ListFilters
              search=""
              onSearchChange={() => {}}
              searchPlaceholder="Search is available in list view"
              branchName={branchName}
              onBranchChange={onBranchChange}
            />
          )}
        </div>
        {/* List/calendar view toggle (kept in the URL) */}
        <div className="flex shrink-0 gap-1 rounded-lg border border-border p-1">
          <Button
            isIconOnly
            size="sm"
            variant={view === "list" ? "primary" : "ghost"}
            aria-label="List view"
            onPress={() => onViewChange("list")}
          >
            <ListIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant={view === "calendar" ? "primary" : "ghost"}
            aria-label="Calendar view"
            onPress={() => onViewChange("calendar")}
          >
            <CalendarDaysIcon className="size-4" />
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : view === "calendar" ? (
        <CalendarGrid
          year={yearNum}
          month={monthNum}
          events={items}
          onPrevMonth={() => onMonthChange(shiftMonth(activeMonth, -1))}
          onNextMonth={() => onMonthChange(shiftMonth(activeMonth, 1))}
          onEventClick={openEdit}
        />
      ) : total === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No events match your filters"
            description="Try a different search term or branch."
          />
        ) : (
          <EmptyState
            title="No events yet"
            description="Add the first event to get started."
            action={
              <Button variant="primary" onPress={openCreate}>
                <PlusIcon className="size-4" />
                Add event
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openEdit(event)}
                onDelete={() => setDeleting(event)}
              />
            ))}
          </div>
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onChange={onPageChange}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete event"
        description={`Remove ${displayTitle(deleting?.titleBn, deleting?.titleEn)}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
