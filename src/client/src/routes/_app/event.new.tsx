import { createFileRoute } from "@tanstack/react-router";
import { EventFormPage } from "../../components/pages";

export const Route = createFileRoute("/_app/event/new")({
  component: EventFormPage,
});
