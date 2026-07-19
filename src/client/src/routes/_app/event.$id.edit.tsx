import { createFileRoute } from "@tanstack/react-router";
import { EventFormPage } from "../../components/pages";

export const Route = createFileRoute("/_app/event/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <EventFormPage id={Number(id)} />;
}
