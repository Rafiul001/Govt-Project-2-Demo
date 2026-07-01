import {
  Button,
  Input,
  ListBox,
  ListBoxItem,
  Select,
  TextField,
  toast,
} from "@heroui/react";
import { ChevronDownIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useBanners, useDeleteBanner } from "../../hooks/useBanners";
import { useBranches } from "../../hooks/useBranches";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
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
import { BannerForm, FormModal, TablePagination } from "../organisms";

type TListPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
};

const ALL_BRANCHES = "all";

/**
 * Debounced search box. Owns its input text so keystrokes stay smooth and never
 * remount the field (which would drop focus). It stays mounted and adopts
 * external changes to the URL `value` (e.g. browser back/forward) during render
 * — our own debounced pushes also update `value`, but by then `text` already
 * matches, so those are no-ops and typing is never interrupted.
 */
function BannerSearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const [seenValue, setSeenValue] = useState(value);

  if (value !== seenValue) {
    setSeenValue(value);
    setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return;
    const id = setTimeout(() => onChange(next), 350);
    return () => clearTimeout(id);
  }, [text, value, onChange]);

  return (
    <TextField
      className="flex flex-1 flex-col gap-1.5"
      aria-label="Search banners"
      value={text}
      onChange={setText}
    >
      <div className="relative w-full">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          className="w-full pl-9"
          placeholder="Search by title or subtitle…"
        />
      </div>
    </TextField>
  );
}

export function BannersPage({
  page,
  pageSize,
  search,
  branchName,
  onPageChange,
  onSearchChange,
  onBranchChange,
}: TListPageProps) {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";

  const query = useBanners({ page, pageSize, search, branchName });
  const deleteMutation = useDeleteBanner();
  // Branch options only matter for super admins (branch admins are pinned).
  const branchesQuery = useBranches(
    { page: 1, pageSize: 100 },
    { enabled: isSuperAdmin },
  );

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
  const branches = branchesQuery.data?.items ?? [];
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <BannerSearchBox value={search ?? ""} onChange={onSearchChange} />

        {isSuperAdmin ? (
          <Select
            className="flex flex-col gap-1.5 sm:w-64"
            aria-label="Filter by branch"
            selectedKey={branchName ?? ALL_BRANCHES}
            onSelectionChange={(key) =>
              onBranchChange(key === ALL_BRANCHES ? "" : String(key))
            }
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator>
                <ChevronDownIcon className="size-4" />
              </Select.Indicator>
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBoxItem id={ALL_BRANCHES}>All branches</ListBoxItem>
                {branches.map((branch) => (
                  <ListBoxItem key={branch.id} id={branch.name}>
                    {branch.name}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
      </div>

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
