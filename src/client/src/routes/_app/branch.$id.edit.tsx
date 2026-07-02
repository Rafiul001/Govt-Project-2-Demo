import { createFileRoute, redirect } from "@tanstack/react-router";
import { BranchEditPage } from "../../components/pages";
import { decodeAdminToken } from "../../lib/token";
import { useAuthStore } from "../../store/auth.store";

/**
 * Branch editor rendered inside the dashboard shell (sidebar + top bar):
 * editable details on the left, a live landing-page preview on the right.
 * Super admins only — the `_app` layout already guards for authentication.
 */
export const Route = createFileRoute("/_app/branch/$id/edit")({
  beforeLoad: () => {
    const admin = decodeAdminToken(useAuthStore.getState().accessToken);
    if (admin?.adminType !== "SUPER_ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <BranchEditPage id={Number(id)} />;
}
