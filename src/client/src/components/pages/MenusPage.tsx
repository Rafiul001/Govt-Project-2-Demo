import { Button, toast } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useDeleteMenu, useMenus } from "../../hooks/useMenus";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TMenu } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import {
  FormModal,
  ListFilters,
  MenuForm,
  TablePagination,
} from "../organisms";

type TMenusPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
};

/** Groups menus by branch, preserving the list's order within each group. */
function groupMenusByBranch(
  menus: TMenu[],
): { branchId: number; menus: TMenu[] }[] {
  const groups = new Map<number, TMenu[]>();
  for (const menu of menus) {
    const group = groups.get(menu.branchId);
    if (group) group.push(menu);
    else groups.set(menu.branchId, [menu]);
  }
  return [...groups.entries()].map(([branchId, grouped]) => ({
    branchId,
    menus: grouped,
  }));
}

/** Manage the top-level menus of the public site; each links to its sub-menus. */
export function MenusPage({
  page,
  pageSize,
  search,
  branchName,
  onPageChange,
  onSearchChange,
  onBranchChange,
}: TMenusPageProps) {
  const query = useMenus({ page, pageSize, search, branchName });
  const deleteMutation = useDeleteMenu();
  // Menus are listed across branches, so resolve branch names to group under.
  // The branch list is public data and small (one row per branch).
  const branchesQuery = useBranches({ page: 1, pageSize: 100 });
  const branchNameById = new Map(
    (branchesQuery.data?.items ?? []).map((b) => [b.id, b.name]),
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TMenu | null>(null);
  const [deleting, setDeleting] = useState<TMenu | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Menu deleted");
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
        title="Menus"
        description="Top-level navigation menus. Each menu groups the sub-menu pages shown on the public site."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add menu
          </Button>
        }
      />

      <ListFilters
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by title…"
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
            title="No menus match your filters"
            description="Try a different search term or branch."
          />
        ) : (
          <EmptyState
            title="No menus yet"
            description="Add the first menu to start building the site navigation."
            action={
              <Button variant="primary" onPress={() => setIsCreating(true)}>
                <PlusIcon className="size-4" />
                Add menu
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-6">
          {groupMenusByBranch(items).map(({ branchId, menus }) => (
            <section key={branchId} className="space-y-2">
              <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {branchNameById.get(branchId) ?? `Branch #${branchId}`}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-secondary">
                {menus.map((menu) => (
                  <li
                    key={menu.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-tertiary"
                  >
                    <Link
                      to="/menus/$menuId"
                      params={{ menuId: String(menu.id) }}
                      search={{ page: 1, pageSize: 10 }}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <span className="shrink-0 text-xs text-muted">
                        #{menu.order}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {displayTitle(menu.titleBn, menu.titleEn)}
                        </p>
                        <p className="truncate text-xs text-muted">
                          /{menu.slug}
                        </p>
                      </div>
                    </Link>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label="Edit menu"
                      onPress={() => setEditing(menu)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label="Delete menu"
                      className="text-red-500 hover:bg-red-500/15"
                      onPress={() => setDeleting(menu)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                    <Link
                      to="/menus/$menuId"
                      params={{ menuId: String(menu.id) }}
                      search={{ page: 1, pageSize: 10 }}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-accent hover:bg-accent/10"
                    >
                      Sub-menus
                      <ChevronRightIcon className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
        title={editing ? "Edit menu" : "Add menu"}
      >
        <MenuForm
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
        title="Delete menu"
        description={`Delete "${deleting ? displayTitle(deleting.titleBn, deleting.titleEn) : "this menu"}"? Its sub-menus and their pages will also be deleted. This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
