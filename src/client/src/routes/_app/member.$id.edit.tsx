import { createFileRoute } from "@tanstack/react-router";
import { MemberFormPage } from "../../components/pages";

export const Route = createFileRoute("/_app/member/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <MemberFormPage id={Number(id)} />;
}
