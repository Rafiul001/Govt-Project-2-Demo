import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "../../components/pages";
import { noticesSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/notices")({
  validateSearch: (search) => noticesSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, selected } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <NoticesPage
      page={page}
      pageSize={pageSize}
      initialSelectedId={selected}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );
}
