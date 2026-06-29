import { Button, Chip, toast } from "@heroui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useDeleteLayout, useLayouts } from "../../hooks/useLayouts";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TLayout } from "../../types";
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
  LayoutForm,
  TablePagination,
  type DataTableColumn,
} from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

const YesNo = ({ value }: { value: boolean }) => (
  <Chip color={value ? "success" : "default"} variant="soft">
    {value ? "Yes" : "No"}
  </Chip>
);

export function LayoutsPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useLayouts({ page, pageSize });
  const deleteMutation = useDeleteLayout();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TLayout | null>(null);
  const [deleting, setDeleting] = useState<TLayout | null>(null);

  const columns: DataTableColumn<TLayout>[] = [
    {
      key: "branchId",
      header: "Branch",
      isRowHeader: true,
      render: (row) => row.branchId,
    },
    {
      key: "sidebarPosition",
      header: "Sidebar",
      render: (row) => (
        <span className="capitalize">{row.sidebarPosition}</span>
      ),
    },
    {
      key: "showLogo",
      header: "Logo",
      render: (row) => <YesNo value={row.showLogo} />,
    },
    {
      key: "showBanner",
      header: "Banner",
      render: (row) => <YesNo value={row.showBanner} />,
    },
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
        <div className="space-y-4">
          <DataTable ariaLabel="Layouts" columns={columns} rows={items} />
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
