import { Button, toast } from "@heroui/react";
import {
  DownloadIcon,
  LayoutGridIcon,
  PencilIcon,
  PlusIcon,
  PrinterIcon,
  TableIcon,
  TrashIcon,
  EyeIcon,
} from "lucide-react";
import { useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { useMemberCategories } from "../../hooks/useMemberCategories";
import {
  useDeleteMember,
  useExportMembersCsv,
  useMembers,
} from "../../hooks/useMembers";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TMember } from "../../types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  MemberCard,
  MemberProfile,
  PageHeader,
} from "../molecules";
import {
  DataTable,
  FormModal,
  ListFilters,
  MemberForm,
  TablePagination,
  type TDataTableColumn,
} from "../organisms";

type TMemberView = "grid" | "table";

type TMembersPageProps = {
  page: number;
  pageSize: number;
  search?: string;
  branchName?: string;
  categoryId?: number;
  view: TMemberView;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onCategoryChange: (value: number | undefined) => void;
  onViewChange: (view: TMemberView) => void;
};

/**
 * GEMS-style member profiles (players, coaches, officials, physios, …),
 * viewable as a profile-card grid or a table, filterable by category, and
 * downloadable as CSV or a printable PDF honouring the active filters.
 */
export function MembersPage({
  page,
  pageSize,
  search,
  branchName,
  categoryId,
  view,
  onPageChange,
  onSearchChange,
  onBranchChange,
  onCategoryChange,
  onViewChange,
}: TMembersPageProps) {
  const params = { page, pageSize, search, branchName, categoryId };
  const query = useMembers(params);
  const deleteMutation = useDeleteMember();
  const exportMutation = useExportMembersCsv();

  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";

  const categoriesQuery = useMemberCategories();
  const categoryLabel = new Map(
    (categoriesQuery.data?.items ?? []).map((category) => [
      category.id,
      displayTitle(category.nameBn, category.nameEn),
    ]),
  );

  const branchesQuery = useBranches(
    { page: 1, pageSize: 100 },
    { enabled: isSuperAdmin },
  );
  const branchLabel = new Map(
    (branchesQuery.data?.items ?? []).map((branch) => [
      branch.id,
      branch.name,
    ]),
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<TMember | null>(null);
  const [viewing, setViewing] = useState<TMember | null>(null);
  const [deleting, setDeleting] = useState<TMember | null>(null);

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Member deleted");
        setDeleting(null);
      },
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  const handleExportCsv = () => {
    exportMutation.mutate(params, {
      onError: (error) => toast.danger(getApiErrorMessage(error)),
    });
  };

  /** Open the print-optimized list in a new tab with the current filters. */
  const handlePrint = () => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search);
    if (branchName) searchParams.set("branchName", branchName);
    if (categoryId) searchParams.set("categoryId", String(categoryId));
    window.open(`/print/members?${searchParams}`, "_blank", "noopener");
  };

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;
  const isFiltered =
    Boolean(search) || Boolean(branchName) || categoryId !== undefined;

  const columns: TDataTableColumn<TMember>[] = [
    {
      key: "name",
      header: "Name",
      isRowHeader: true,
      render: (member) => (
        <span className="font-medium">
          {displayTitle(member.nameBn, member.nameEn)}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (member) => categoryLabel.get(member.categoryId) ?? "—",
    },
    {
      key: "designation",
      header: "Designation",
      render: (member) => member.designation ?? "—",
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (member) => member.mobile ?? "—",
    },
    ...(isSuperAdmin
      ? [
          {
            key: "branch",
            header: "Branch",
            render: (member) => branchLabel.get(member.branchId) ?? "—",
          } satisfies TDataTableColumn<TMember>,
        ]
      : []),
    { key: "order", header: "Order", render: (member) => member.order },
    {
      key: "actions",
      header: "",
      render: (member) => (
        <div className="flex justify-end gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="View profile"
            onPress={() => setViewing(member)}
          >
            <EyeIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Edit"
            onPress={() => setEditing(member)}
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Delete"
            className="text-red-500 hover:bg-red-500/15"
            onPress={() => setDeleting(member)}
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
        title="Members"
        description="Player, coach, official and other profiles shown on the public sites."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onPress={handleExportCsv}
              isDisabled={exportMutation.isPending}
            >
              <DownloadIcon className="size-4" />
              CSV
            </Button>
            <Button variant="ghost" onPress={handlePrint}>
              <PrinterIcon className="size-4" />
              PDF / Print
            </Button>
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add member
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <ListFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search by name, designation, mobile or email…"
            branchName={branchName}
            onBranchChange={onBranchChange}
            categoryId={categoryId}
            onCategoryChange={onCategoryChange}
          />
        </div>
        {/* Grid/table view toggle (kept in the URL) */}
        <div className="flex shrink-0 gap-1 rounded-lg border border-border p-1">
          <Button
            isIconOnly
            size="sm"
            variant={view === "grid" ? "primary" : "ghost"}
            aria-label="Card view"
            onPress={() => onViewChange("grid")}
          >
            <LayoutGridIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant={view === "table" ? "primary" : "ghost"}
            aria-label="Table view"
            onPress={() => onViewChange("table")}
          >
            <TableIcon className="size-4" />
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No members match your filters"
            description="Try a different search term, category or branch."
          />
        ) : (
          <EmptyState
            title="No members yet"
            description="Add the first member to get started."
            action={
              <Button variant="primary" onPress={() => setIsCreating(true)}>
                <PlusIcon className="size-4" />
                Add member
              </Button>
            }
          />
        )
      ) : (
        <div className="space-y-6">
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {items.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  categoryLabel={categoryLabel.get(member.categoryId) ?? "—"}
                  onView={() => setViewing(member)}
                  onEdit={() => setEditing(member)}
                  onDelete={() => setDeleting(member)}
                />
              ))}
            </div>
          ) : (
            <DataTable ariaLabel="Members" columns={columns} rows={items} />
          )}
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
        title={editing ? "Edit member" : "Add member"}
      >
        <MemberForm
          initial={editing ?? undefined}
          defaultCategoryId={categoryId}
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

      <FormModal
        isOpen={viewing !== null}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title="Member profile"
      >
        {viewing ? (
          <MemberProfile
            member={viewing}
            categoryLabel={categoryLabel.get(viewing.categoryId) ?? "—"}
            branchName={
              isSuperAdmin ? branchLabel.get(viewing.branchId) : undefined
            }
          />
        ) : null}
      </FormModal>

      <ConfirmDialog
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete member"
        description={`Remove ${displayTitle(deleting?.nameBn, deleting?.nameEn)}? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
