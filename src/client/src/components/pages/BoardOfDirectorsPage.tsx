import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  useBoardOfDirectors,
  useDeleteBoardOfDirector,
} from "../../hooks/useBoardOfDirectors";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TBoardOfDirector } from "../../types";
import {
  BoardMemberCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import { BoardOfDirectorForm, FormModal, TablePagination } from "../organisms";

type TListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function BoardOfDirectorsPage({
  page,
  pageSize,
  onPageChange,
}: TListPageProps) {
  const query = useBoardOfDirectors({ page, pageSize });
  const deleteMutation = useDeleteBoardOfDirector();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TBoardOfDirector | null>(null);
  const [deleting, setDeleting] = useState<TBoardOfDirector | null>(null);

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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {items.map((member) => (
              <BoardMemberCard
                key={member.id}
                member={member}
                onEdit={() => setEditing(member)}
                onDelete={() => setDeleting(member)}
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
