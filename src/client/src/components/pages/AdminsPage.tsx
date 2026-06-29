import { Avatar, Button, Chip, toast } from "@heroui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useAdmins, useDeleteAdmin } from "../../hooks/useAdmins";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TAdmin } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import {
  AdminForm,
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

export function AdminsPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useAdmins({ page, pageSize });
  const deleteMutation = useDeleteAdmin();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TAdmin | null>(null);
  const [deleting, setDeleting] = useState<TAdmin | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Admin deleted");
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const columns: DataTableColumn<TAdmin>[] = [
    {
      key: "admin",
      header: "Admin",
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
    { key: "username", header: "Username", render: (row) => row.username },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Chip
          color={row.adminType === "SUPER_ADMIN" ? "accent" : "default"}
          variant="soft"
        >
          {row.adminType === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"}
        </Chip>
      ),
    },
    {
      key: "branchId",
      header: "Branch",
      render: (row) => row.branchId ?? "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        // Super admins are seeded and cannot be edited/deleted in the panel.
        row.adminType === "SUPER_ADMIN" ? (
          <span className="text-muted">—</span>
        ) : (
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

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Create and review portal administrators."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add admin
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No admins found"
          description="Create the first administrator."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add admin
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable ariaLabel="Admins" columns={columns} rows={items} />
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
        title={editing ? "Edit admin" : "Add admin"}
      >
        <AdminForm
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
        title="Delete admin"
        description={`Delete ${deleting?.name ?? "this admin"}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
