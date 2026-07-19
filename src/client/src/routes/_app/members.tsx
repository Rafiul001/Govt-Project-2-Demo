import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "../../components/pages";
import { membersSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/members")({
  validateSearch: (search) => membersSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, search, branchName, categoryId, view } =
    Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <MembersPage
      page={page}
      pageSize={pageSize}
      search={search}
      branchName={branchName}
      categoryId={categoryId}
      view={view}
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
      onCategoryChange={(value) =>
        navigate({
          search: (prev) => ({ ...prev, categoryId: value, page: 1 }),
        })
      }
      onViewChange={(value) =>
        navigate({ search: (prev) => ({ ...prev, view: value }) })
      }
    />
  );
}
