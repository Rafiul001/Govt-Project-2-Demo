import { createFileRoute } from "@tanstack/react-router";
import { SubmenusPage } from "../../components/pages";
import { listSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/menus/$menuId")({
  validateSearch: (search) => listSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { menuId } = Route.useParams();
  const { page, pageSize } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <SubmenusPage
      menuId={Number(menuId)}
      page={page}
      pageSize={pageSize}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );
}
