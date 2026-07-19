import { Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useMember } from "../../hooks/useMembers";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import { ErrorState, LoadingState, PageHeader } from "../molecules";
import { MemberForm } from "../organisms";

/** Search params of the members list to return to after saving/cancelling. */
const MEMBERS_LIST_SEARCH = { page: 1, pageSize: 10, view: "grid" } as const;

/**
 * Full-page member editor (`/member/new`, `/member/:id/edit`) — the
 * GEMS-style profile has too many fields for a modal. Loads the member when
 * editing and returns to the members list when done.
 */
export function MemberFormPage({
  id,
  defaultCategoryId,
}: {
  /** Member id when editing; omit to create. */
  id?: number;
  /** Pre-selected category for new members (from the list's active filter). */
  defaultCategoryId?: number;
}) {
  const isEdit = id !== undefined;
  const memberQuery = useMember(id ?? NaN);
  const navigate = useNavigate();
  const goBack = () =>
    navigate({ to: "/members", search: MEMBERS_LIST_SEARCH });

  if (isEdit && memberQuery.isLoading) return <LoadingState />;
  if (isEdit && (memberQuery.isError || !memberQuery.data)) {
    return <ErrorState message={getApiErrorMessage(memberQuery.error)} />;
  }
  const member = isEdit ? memberQuery.data : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        title={
          isEdit
            ? `Edit member — ${displayTitle(member?.nameBn, member?.nameEn)}`
            : "Add member"
        }
        description="GEMS-style profile shown on the public site (private fields stay admin-only)."
        actions={
          <Button variant="ghost" onPress={goBack}>
            <ArrowLeftIcon className="size-4" />
            Back to members
          </Button>
        }
      />
      <div className="rounded-xl border border-border bg-surface-secondary p-6 shadow-(--card-shadow)">
        <MemberForm
          initial={member}
          defaultCategoryId={defaultCategoryId}
          onSuccess={goBack}
          onCancel={goBack}
        />
      </div>
    </div>
  );
}
