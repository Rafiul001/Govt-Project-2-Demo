import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MemberFormPage } from "../../components/pages";

// The members list forwards its active category filter so a member added from
// a filtered view starts in that category.
const newMemberSearchSchema = z.strictObject({
  categoryId: z.coerce.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/member/new")({
  validateSearch: (search) => newMemberSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { categoryId } = Route.useSearch();
  return <MemberFormPage defaultCategoryId={categoryId} />;
}
