import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "../../components/pages";
import { listSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/notices")({
  validateSearch: (search) => listSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <NoticesPage
      page={page}
      pageSize={pageSize}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );
}
