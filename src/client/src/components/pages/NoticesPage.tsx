import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
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
import { FormModal, NoticeForm, TablePagination } from "../organisms";

type TListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Optional notice id to preview on first render (e.g. deep-linked). */
  initialSelectedId?: number;
};

export function NoticesPage({
  page,
  pageSize,
  onPageChange,
  initialSelectedId,
}: TListPageProps) {
  const query = useNotices({ page, pageSize });
  const deleteMutation = useDeleteNotice();

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

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
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
      ) : (
        <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1 lg:flex-row">
          {/* List */}
          <div className="flex flex-col gap-3 lg:w-4/12 lg:overflow-y-auto lg:pr-1">
            {items.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                isSelected={notice.id === selectedId}
                onSelect={() => setSelectedId(notice.id)}
              />
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
