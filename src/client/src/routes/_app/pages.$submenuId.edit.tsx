import { createFileRoute } from "@tanstack/react-router";
import { PageEditPage } from "../../components/pages";

/**
 * Dynamic-page editor rendered inside the dashboard shell: page content on the
 * left, a live landing-page preview on the right. Reached from a sub-menu's
 * "Edit page" action; the `_app` layout already guards for authentication.
 */
export const Route = createFileRoute("/_app/pages/$submenuId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { submenuId } = Route.useParams();
  return <PageEditPage submenuId={Number(submenuId)} />;
}
