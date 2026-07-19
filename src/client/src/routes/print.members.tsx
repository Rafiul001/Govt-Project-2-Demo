import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { PrintMembersPage } from "../components/pages";
import { useAuthStore } from "../store/auth.store";

const printSearchSchema = z.strictObject({
  search: z.string().trim().min(1).optional().catch(undefined),
  branchName: z.string().trim().min(1).optional().catch(undefined),
  categoryId: z.coerce.number().int().positive().optional().catch(undefined),
});

/**
 * Print-optimized member list, opened in a new tab by the members page. Lives
 * outside the `/_app` layout so no sidebar/topbar ends up in the printout;
 * auth is the same token check the app layout does.
 */
export const Route = createFileRoute("/print/members")({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  validateSearch: (search) => printSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { search, branchName, categoryId } = Route.useSearch();
  return (
    <PrintMembersPage
      search={search}
      branchName={branchName}
      categoryId={categoryId}
    />
  );
}
