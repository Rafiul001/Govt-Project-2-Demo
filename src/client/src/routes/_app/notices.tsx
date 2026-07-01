import { createFileRoute } from "@tanstack/react-router";
import { NoticesPage } from "../../components/pages";
import { noticesSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/notices")({
  validateSearch: (search) => noticesSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, search, branchName, selected } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <NoticesPage
      page={page}
      pageSize={pageSize}
      search={search}
      branchName={branchName}
      initialSelectedId={selected}
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
