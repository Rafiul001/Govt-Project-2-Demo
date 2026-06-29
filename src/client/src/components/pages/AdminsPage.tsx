import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAdmins, useDeleteAdmin } from "../../hooks/useAdmins";
import { useBranches } from "../../hooks/useBranches";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TAdmin } from "../../types";
import {
  AdminCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import { AdminForm, FormModal, TablePagination } from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function AdminsPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useAdmins({ page, pageSize });
  const branchesQuery = useBranches({ page: 1, pageSize: 100 });
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

  const branchName = (id: number | null) =>
    branchesQuery.data?.items.find((b) => b.id === id)?.name;

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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                branchName={branchName(admin.branchId)}
                onEdit={() => setEditing(admin)}
                onDelete={() => setDeleting(admin)}
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
