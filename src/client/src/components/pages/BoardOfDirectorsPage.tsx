import { Avatar, Button, toast } from "@heroui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  useBoardOfDirectors,
  useDeleteBoardOfDirector,
} from "../../hooks/useBoardOfDirectors";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TBoardOfDirector } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import {
  BoardOfDirectorForm,
  DataTable,
  FormModal,
  TablePagination,
  type DataTableColumn,
} from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function BoardOfDirectorsPage({
  page,
  pageSize,
  onPageChange,
}: ListPageProps) {
  const query = useBoardOfDirectors({ page, pageSize });
  const deleteMutation = useDeleteBoardOfDirector();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TBoardOfDirector | null>(null);
  const [deleting, setDeleting] = useState<TBoardOfDirector | null>(null);

  const columns: DataTableColumn<TBoardOfDirector>[] = [
    {
      key: "member",
      header: "Member",
      isRowHeader: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <Avatar.Image src={row.avatar} />
            <Avatar.Fallback>{row.name.charAt(0)}</Avatar.Fallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      render: (row) => row.designation,
    },
    { key: "order", header: "Order", render: (row) => row.order },
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
        toast.success("Board member deleted");
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
        title="Board of Directors"
        description="Manage the board members shown on the public site."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add member
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No board members yet"
          description="Add the first board member to get started."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add member
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            ariaLabel="Board of directors"
            columns={columns}
            rows={items}
          />
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
        title={editing ? "Edit board member" : "Add board member"}
      >
        <BoardOfDirectorForm
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
        title="Delete board member"
        description={`Remove ${deleting?.name ?? "this member"}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
