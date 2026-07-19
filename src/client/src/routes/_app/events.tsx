import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "../../components/pages";
import { eventsSearchSchema } from "../../validators/search";

export const Route = createFileRoute("/_app/events")({
  validateSearch: (search) => eventsSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { page, pageSize, search, branchName, view, month } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <EventsPage
      page={page}
      pageSize={pageSize}
      search={search}
      branchName={branchName}
      view={view}
      month={month}
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
      onViewChange={(value) =>
        navigate({ search: (prev) => ({ ...prev, view: value }) })
      }
      onMonthChange={(value) =>
        navigate({ search: (prev) => ({ ...prev, month: value }) })
      }
    />
  );
}
