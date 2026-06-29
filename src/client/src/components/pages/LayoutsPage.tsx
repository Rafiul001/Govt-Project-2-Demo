import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { useDeleteLayout, useLayouts } from "../../hooks/useLayouts";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TLayout } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LayoutCard,
  LoadingState,
  PageHeader,
} from "../molecules";
import { FormModal, LayoutForm, TablePagination } from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function LayoutsPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useLayouts({ page, pageSize });
  const deleteMutation = useDeleteLayout();
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  // The branch list endpoint is super-admin only; branch admins fall back to
  // showing the branch id.
  const branchesQuery = useBranches(
    { page: 1, pageSize: 100 },
    { enabled: isSuperAdmin },
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TLayout | null>(null);
  const [deleting, setDeleting] = useState<TLayout | null>(null);

  const branchName = (id: number) =>
    branchesQuery.data?.items.find((b) => b.id === id)?.name;

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Layout deleted");
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
        title="Layouts"
        description="Configure per-branch display settings."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add layout
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No layouts yet"
          description="Create a layout to control how a branch is displayed."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add layout
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                branchName={branchName(layout.branchId)}
                onEdit={() => setEditing(layout)}
                onDelete={() => setDeleting(layout)}
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
        title={editing ? "Edit layout" : "Add layout"}
      >
        <LayoutForm
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
        title="Delete layout"
        description="Delete this layout? This cannot be undone."
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
