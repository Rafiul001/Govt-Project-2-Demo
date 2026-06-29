import {
  LayoutTemplateIcon,
  MegaphoneIcon,
  ShieldUserIcon,
  UsersIcon,
} from "lucide-react";
import { useAdmins } from "../../hooks/useAdmins";
import { useBoardOfDirectors } from "../../hooks/useBoardOfDirectors";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { useLayouts } from "../../hooks/useLayouts";
import { useNotices } from "../../hooks/useNotices";
import { PageHeader, StatCard } from "../molecules";

export function DashboardPage() {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";

  // We only need the totals, so request a single row per resource.
  const countParams = { page: 1, pageSize: 1 };
  const board = useBoardOfDirectors(countParams);
  const notices = useNotices(countParams);
  const layouts = useLayouts(countParams);
  const admins = useAdmins(countParams);

  const dash = (value: number | undefined, isLoading: boolean) =>
    isLoading ? "…" : (value ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${admin ? "" : " back"}`}
        description="Overview of your branch content."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Board members"
          value={dash(board.data?.total, board.isLoading)}
          icon={<UsersIcon className="size-6" />}
        />
        <StatCard
          label="Notices"
          value={dash(notices.data?.total, notices.isLoading)}
          icon={<MegaphoneIcon className="size-6" />}
        />
        <StatCard
          label="Layouts"
          value={dash(layouts.data?.total, layouts.isLoading)}
          icon={<LayoutTemplateIcon className="size-6" />}
        />
        {isSuperAdmin ? (
          <StatCard
            label="Admins"
            value={dash(admins.data?.total, admins.isLoading)}
            icon={<ShieldUserIcon className="size-6" />}
          />
        ) : null}
      </div>
    </div>
  );
}
