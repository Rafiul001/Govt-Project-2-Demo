import { Button, toast } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useBanners, useDeleteBanner } from "../../hooks/useBanners";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TBanner } from "../../types";
import {
  BannerCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import {
  BannerForm,
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

export function BannersPage({
  page,
  pageSize,
  search,
  branchName,
  onPageChange,
  onSearchChange,
  onBranchChange,
}: TListPageProps) {
  const query = useBanners({ page, pageSize, search, branchName });
  const deleteMutation = useDeleteBanner();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TBanner | null>(null);
  const [deleting, setDeleting] = useState<TBanner | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Banner deleted");
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const isFiltered = Boolean(search) || Boolean(branchName);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage the hero slider banners shown on the public site."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add banner
          </Button>
        }
      />

      <ListFilters
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by title or subtitle…"
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
            title="No banners match your filters"
            description="Try a different search term or branch."
          />
        ) : (
          <EmptyState
            title="No banners yet"
            description="Add the first banner to show it in the hero slider."
            action={
              <Button variant="primary" onPress={() => setIsCreating(true)}>
                <PlusIcon className="size-4" />
                Add banner
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={() => setEditing(banner)}
                onDelete={() => setDeleting(banner)}
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
        title={editing ? "Edit banner" : "Add banner"}
      >
        <BannerForm
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
        title="Delete banner"
        description={`Delete "${deleting?.title ?? "this banner"}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
