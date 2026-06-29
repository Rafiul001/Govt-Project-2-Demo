import { Avatar, Button, Chip } from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useAdmins } from "../../hooks/useAdmins";
import { getApiErrorMessage } from "../../lib/apiError";
import type { TAdmin } from "../../types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../molecules";
import {
  AdminForm,
  DataTable,
  FormModal,
  TablePagination,
  type DataTableColumn,
} from "../organisms";

type ListPageProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function AdminsPage({ page, pageSize, onPageChange }: ListPageProps) {
  const query = useAdmins({ page, pageSize });
  const [isCreating, setIsCreating] = useState(false);

  const columns: DataTableColumn<TAdmin>[] = [
    {
      key: "admin",
      header: "Admin",
      isRowHeader: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <Avatar.Image src={row.avatar} />
            <Avatar.Fallback>{row.name.charAt(0)}</Avatar.Fallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: "username", header: "Username", render: (row) => row.username },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Chip
          color={row.adminType === "SUPER_ADMIN" ? "accent" : "default"}
          variant="soft"
        >
          {row.adminType === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"}
        </Chip>
      ),
    },
    {
      key: "branchId",
      header: "Branch",
      render: (row) => row.branchId ?? "—",
    },
  ];

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Create and review portal administrators."
        actions={
          <Button variant="primary" onPress={() => setIsCreating(true)}>
            <PlusIcon className="size-4" />
            Add admin
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={getApiErrorMessage(query.error)} />
      ) : total === 0 ? (
        <EmptyState
          title="No admins found"
          description="Create the first administrator."
          action={
            <Button variant="primary" onPress={() => setIsCreating(true)}>
              <PlusIcon className="size-4" />
              Add admin
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable ariaLabel="Admins" columns={columns} rows={items} />
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
        onOpenChange={setIsCreating}
        title="Add admin"
      >
        <AdminForm
          onSuccess={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      </FormModal>
    </div>
  );
}
