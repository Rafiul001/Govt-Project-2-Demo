import { createFileRoute } from "@tanstack/react-router";
import { MemberCategoriesPage } from "../../components/pages";

export const Route = createFileRoute("/_app/member-categories")({
  component: MemberCategoriesPage,
});
