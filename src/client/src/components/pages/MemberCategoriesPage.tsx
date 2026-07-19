import { Button, toast } from "@heroui/react";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  useDeleteMemberCategory,
  useMemberCategories,
} from "../../hooks/useMemberCategories";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TMemberCategory } from "../../types";
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
  MemberCategoryForm,
  type TDataTableColumn,
} from "../organisms";

/**
 * Super-admin management of the dynamic member categories (খেলোয়াড়, কোচ, …).
 * New kinds of people can be added here without a code change; each category
 * gets its own page on every branch's public site (`/members/:slug`).
 */
export function MemberCategoriesPage() {
  const query = useMemberCategories();
  const deleteMutation = useDeleteMemberCategory();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TMemberCategory | null>(null);
  const [deleting, setDeleting] = useState<TMemberCategory | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Category deleted");
        setDeleting(null);
      },
      // Deleting a category that still has members is refused by the API.
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const items = query.data?.items ?? [];

  const columns: TDataTableColumn<TMemberCategory>[] = [
    {
      key: "name",
      header: "Name",
      isRowHeader: true,
      render: (category) => (
        <span className="font-medium">
          {displayTitle(category.nameBn, category.nameEn)}
        </span>
      ),
    },
    {
      key: "slug",
      header: "URL slug",
      render: (category) => (
        <code className="text-sm text-muted">/members/{category.slug}</code>
      ),
    },
    { key: "order", header: "Order", render: (category) => category.order },
    {
      key: "actions",
      header: "",
      render: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Edit"
            onPress={() => setEditing(category)}
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Delete"
            className="text-red-500 hover:bg-red-500/15"
            onPress={() => setDeleting(category)}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Categories"
        description="Kinds of people (players, coaches, officials…) shown on the public sites. Shared by every branch."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add category
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add the first member category to get started."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add category
            </Button>
          }
        />
      ) : (
        <DataTable
          ariaLabel="Member categories"
          columns={columns}
          rows={items}
        />
      )}

      <FormModal
        isOpen={isCreating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditing(null);
          }
        }}
        title={editing ? "Edit category" : "Add category"}
      >
        <MemberCategoryForm
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
        title="Delete category"
        description={`Remove ${displayTitle(deleting?.nameBn, deleting?.nameEn)}? Categories that still have members cannot be deleted.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
