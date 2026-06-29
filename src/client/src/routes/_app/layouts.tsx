import { createFileRoute } from "@tanstack/react-router";
import { LayoutsPage } from "../../components/pages";
import { listSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/layouts")({
  validateSearch: (search) => listSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <LayoutsPage
      page={page}
      pageSize={pageSize}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );
}
