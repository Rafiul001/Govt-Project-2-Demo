import { Button, Chip, Link, toast } from "@heroui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useDeleteNotice, useNotices } from "../../hooks/useNotices";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TNotice } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import {
  DataTable,
  FormModal,
  NoticeForm,
  TablePagination,
  type DataTableColumn,
} from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function NoticesPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useNotices({ page, pageSize });
  const deleteMutation = useDeleteNotice();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TNotice | null>(null);
  const [deleting, setDeleting] = useState<TNotice | null>(null);

  const columns: DataTableColumn<TNotice>[] = [
    {
      key: "title",
      header: "Title",
      isRowHeader: true,
      render: (row) => row.title,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Chip color={row.isPublished ? "success" : "default"} variant="soft">
          {row.isPublished ? "Published" : "Draft"}
        </Chip>
      ),
    },
    {
      key: "attachments",
      header: "Attachments",
      render: (row) => (
        <div className="flex gap-3 text-sm">
          {row.image ? (
            <Link href={row.image} target="_blank">
              Image
            </Link>
          ) : null}
          {row.fileUrl ? (
            <Link href={row.fileUrl} target="_blank">
              PDF
            </Link>
          ) : null}
          {!row.image && !row.fileUrl ? (
            <span className="text-muted">—</span>
          ) : null}
        </div>
      ),
    },
    { key: "branchId", header: "Branch", render: (row) => row.branchId },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Edit"
            onPress={() => setEditing(row)}
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Delete"
            onPress={() => setDeleting(row)}
          >
            <TrashIcon className="size-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Notice deleted");
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
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
        <div className="space-y-4">
          <DataTable ariaLabel="Notices" columns={columns} rows={items} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onChange={onPageChange}
          />
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
