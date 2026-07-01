import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminsPage } from "../../components/pages";
import { decodeAdminToken } from "../../lib/token";
import { useAuthStore } from "../../store/auth.store";
import { filterSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/admins")({
  validateSearch: (search) => filterSearchSchema.parse(search),
  beforeLoad: () => {
    const admin = decodeAdminToken(useAuthStore.getState().accessToken);
    if (admin?.adminType !== "SUPER_ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, search, branchName } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <AdminsPage
      page={page}
      pageSize={pageSize}
      search={search}
      branchName={branchName}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
      onSearchChange={(value) =>
        navigate({
          search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
        })
      }
      onBranchChange={(value) =>
        navigate({
          search: (prev) => ({
            ...prev,
            branchName: value || undefined,
            page: 1,
          }),
        })
      }
    />
  );
}
