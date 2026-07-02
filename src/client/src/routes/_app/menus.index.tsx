import { createFileRoute } from "@tanstack/react-router";
import { MenusPage } from "../../components/pages";
import { bannersSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/menus/")({
  validateSearch: (search) => bannersSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, search, branchName } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MenusPage
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
