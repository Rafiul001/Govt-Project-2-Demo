import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useDeleteNotice, useNotices } from "../../hooks/useNotices";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TNotice } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  NoticeCard,
  NoticePreview,
  PageHeader,
} from "../molecules";
import {
  FormModal,
  ListFilters,
  NoticeForm,
  TablePagination,
} from "../organisms";

/** Groups notices by branch, preserving the list's order within each group. */
function groupNoticesByBranch(
  notices: TNotice[],
): { branchId: number; notices: TNotice[] }[] {
  const groups = new Map<number, TNotice[]>();
  for (const notice of notices) {
    const group = groups.get(notice.branchId);
    if (group) group.push(notice);
    else groups.set(notice.branchId, [notice]);
  }
  return [...groups.entries()].map(([branchId, grouped]) => ({
    branchId,
    notices: grouped,
  }));
}

type TListPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  /** Optional notice id to preview on first render (e.g. deep-linked). */
  initialSelectedId?: number;
};

export function NoticesPage({
  page,
  pageSize,
  search,
  branchName,
  onPageChange,
  onSearchChange,
  onBranchChange,
  initialSelectedId,
}: TListPageProps) {
  const query = useNotices({ page, pageSize, search, branchName });
  const deleteMutation = useDeleteNotice();
  // Notices are listed across branches, so resolve branch names to group under.
  // The branch list is public data and small (one row per branch).
  const branchesQuery = useBranches({ page: 1, pageSize: 100 });
  const branchNameById = new Map(
    (branchesQuery.data?.items ?? []).map((b) => [b.id, b.name]),
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TNotice | null>(null);
  const [deleting, setDeleting] = useState<TNotice | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedId ?? null,
  );

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Notice deleted");
        if (selectedId === deleting.id) setSelectedId(null);
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const isFiltered = Boolean(search) || Boolean(branchName);

  return (
    <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
      <PageHeader
        title="Notices"
        description="Publish and manage branch notices."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add notice
          </Button>
        }
      />

      <ListFilters
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by title or description…"
        branchName={branchName}
        onBranchChange={onBranchChange}
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No notices match your filters"
            description="Try a different search term or branch."
          />
        ) : (
          <EmptyState
            title="No notices yet"
            description="Create your first notice to publish it on the site."
            action={
              <Button variant="primary" onPress={() => setIsCreating(true)}>
                <PlusIcon className="size-4" />
                Add notice
              </Button>
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1 lg:flex-row">
          {/* List */}
          <div className="flex flex-col gap-3 lg:w-4/12 lg:overflow-y-auto lg:pr-1">
            {groupNoticesByBranch(items).map(({ branchId, notices }) => (
              <section key={branchId} className="space-y-2">
                <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
                  {branchNameById.get(branchId) ?? `Branch #${branchId}`}
                </h2>
                <div className="flex flex-col gap-3">
                  {notices.map((notice) => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      isSelected={notice.id === selectedId}
                      onSelect={() => setSelectedId(notice.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              onChange={onPageChange}
            />
          </div>

          {/* Preview */}
          <div className="lg:min-h-0 lg:w-8/12">
            <NoticePreview
              notice={selected}
              onEdit={() => selected && setEditing(selected)}
              onDelete={() => selected && setDeleting(selected)}
            />
          </div>
        </div>
      )}

      <FormModal
        isOpen={isCreating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit notice" : "Add notice"}
      >
        <NoticeForm
          initial={editing ?? undefined}
          onSuccess={() => {
            setIsCreating(false);
            setEditing(null);
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditing(null);
          }}
        />
      </FormModal>

      <ConfirmDialog
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete notice"
        description={`Delete "${deleting?.title ?? "this notice"}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
