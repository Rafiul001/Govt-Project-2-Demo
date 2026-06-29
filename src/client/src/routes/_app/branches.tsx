import { createFileRoute, redirect } from "@tanstack/react-router";
import { BranchesPage } from "../../components/pages";
import { decodeAdminToken } from "../../lib/token";
import { useAuthStore } from "../../store/auth.store";
import { listSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/branches")({
  validateSearch: (search) => listSearchSchema.parse(search),
  beforeLoad: () => {
    const admin = decodeAdminToken(useAuthStore.getState().accessToken);
    if (admin?.adminType !== "SUPER_ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <BranchesPage
      page={page}
      pageSize={pageSize}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );
}
