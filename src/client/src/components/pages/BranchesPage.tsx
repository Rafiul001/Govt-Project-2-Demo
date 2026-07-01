import { Button, toast } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useBranches, useDeleteBranch } from "../../hooks/useBranches";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TBranch } from "../../types";
import {
  BranchCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import { BranchForm, FormModal, TablePagination } from "../organisms";

type TListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function BranchesPage({ page, pageSize, onPageChange }: TListPageProps) {
  const query = useBranches({ page, pageSize });
  const deleteMutation = useDeleteBranch();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [deleting, setDeleting] = useState<TBranch | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Branch deleted");
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
        title="Branches"
        description="Manage organization branches."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add branch
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No branches yet"
          description="Create the first branch to get started."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add branch
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onSelect={() =>
                  navigate({
                    to: "/branch/$id/edit",
                    params: { id: String(branch.id) },
                  })
                }
                onDelete={() => setDeleting(branch)}
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
        isOpen={isCreating}
        onOpenChange={(open) => {
          if (!open) setIsCreating(false);
        }}
        title="Add branch"
      >
        <BranchForm
          onSuccess={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      </FormModal>

      <ConfirmDialog
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete branch"
        description={`Delete "${deleting?.name ?? "this branch"}"? This also removes its board members and notices, and cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
