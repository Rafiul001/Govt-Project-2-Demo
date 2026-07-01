import { Button, toast } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useMenu } from "../../hooks/useMenus";
import { useDeleteSubmenu, useSubmenus } from "../../hooks/useSubmenus";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TMenu, TSubmenu } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../molecules";
import { FormModal, SubmenuForm, TablePagination } from "../organisms";

type TSubmenusPageProps = {
  menuId: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

/** Loads the parent menu, then renders its sub-menu manager. */
export function SubmenusPage({
  menuId,
  page,
  pageSize,
  onPageChange,
}: TSubmenusPageProps) {
  const menuQuery = useMenu(menuId);

  if (menuQuery.isLoading) return <LoadingState />;
  if (menuQuery.isError || !menuQuery.data) {
    return <ErrorState message={getApiErrorMessage(menuQuery.error)} />;
  }

  return (
    <SubmenusManager
      menu={menuQuery.data}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  );
}

function SubmenusManager({
  menu,
  page,
  pageSize,
  onPageChange,
}: {
  menu: TMenu;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const query = useSubmenus({ page, pageSize, menuId: menu.id });
  const deleteMutation = useDeleteSubmenu();

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TSubmenu | null>(null);
  const [deleting, setDeleting] = useState<TSubmenu | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Sub-menu deleted");
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
      <div>
        <Link
          to="/menus"
          search={{ page: 1, pageSize: 10 }}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to menus
        </Link>
        <PageHeader
          title={`Sub-menus — ${displayTitle(menu.titleBn, menu.titleEn)}`}
          description="Each sub-menu has one page (banner + Markdown content) shown on the public site."
          actions={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add sub-menu
            </Button>
          }
        />
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No sub-menus yet"
          description="Add the first sub-menu; its page is created automatically."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add sub-menu
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-secondary">
            {items.map((submenu) => (
              <li
                key={submenu.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-tertiary"
              >
                <span className="shrink-0 text-xs text-muted">
                  #{submenu.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {displayTitle(submenu.titleBn, submenu.titleEn)}
                  </p>
                  <p className="truncate text-xs text-muted">
                    /{menu.slug}/{submenu.slug}
                  </p>
                </div>
                <Link
                  to="/pages/$submenuId/edit"
                  params={{ submenuId: String(submenu.id) }}
                  className="flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1.5 text-sm font-medium text-accent hover:bg-accent/20"
                >
                  <FileTextIcon className="size-4" />
                  Edit page
                </Link>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label="Edit sub-menu"
                  onPress={() => setEditing(submenu)}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label="Delete sub-menu"
                  className="text-red-500 hover:bg-red-500/15"
                  onPress={() => setDeleting(submenu)}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
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
        title={editing ? "Edit sub-menu" : "Add sub-menu"}
      >
        <SubmenuForm
          menu={menu}
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
        title="Delete sub-menu"
        description={`Delete "${deleting ? displayTitle(deleting.titleBn, deleting.titleEn) : "this sub-menu"}"? Its page will also be deleted. This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
