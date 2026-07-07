import { createFileRoute } from "@tanstack/react-router";
import { PageEditPage } from "../../components/pages";

/**
 * Editor for a page attached directly to a menu (menus without sub-menus).
 * Reached from the menu's "Edit page" action; the `_app` layout already
 * guards for authentication.
 */
export const Route = createFileRoute("/_app/pages/by-menu/$menuId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { menuId } = Route.useParams();
  return <PageEditPage menuId={Number(menuId)} />;
}
