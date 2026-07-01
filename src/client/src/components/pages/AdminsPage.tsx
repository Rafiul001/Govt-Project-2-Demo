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
import {
  AdminForm,
  FormModal,
  ListFilters,
  TablePagination,
} from "../organisms";

type TListPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
};

export function AdminsPage({
  page,
  pageSize,
  search,
  branchName,
  onPageChange,
  onSearchChange,
  onBranchChange,
}: TListPageProps) {
  const query = useAdmins({ page, pageSize, search, branchName });
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

  const branchLabel = (id: number | null) =>
    branchesQuery.data?.items.find((b) => b.id === id)?.name;

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const isFiltered = Boolean(search) || Boolean(branchName);

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

      <ListFilters
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name or username…"
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
            title="No admins match your filters"
            description="Try a different search term or branch."
          />
        ) : (
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
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                branchName={branchLabel(admin.branchId)}
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
