import { Chip } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  Building2Icon,
  CalendarIcon,
  LayoutTemplateIcon,
  MegaphoneIcon,
  PlusIcon,
  ShieldUserIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { useAdmins } from "../../hooks/useAdmins";
import { useBoardOfDirectors } from "../../hooks/useBoardOfDirectors";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { useLayouts } from "../../hooks/useLayouts";
import { useNotices } from "../../hooks/useNotices";
import type { TNotice } from "../../types";

type IconType = ComponentType<{ className?: string }>;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const fullDate = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

type StatTileProps = {
  to: string;
  label: string;
  value: number | string;
  icon: IconType;
};

function StatTile({ to, label, value, icon: Icon }: StatTileProps) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface-secondary p-5 shadow-(--card-shadow) transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--card-shadow-hover)"
    >
      <div className="flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Icon className="size-6" />
        </div>
        <ArrowUpRightIcon className="size-5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Link>
  );
}

export function DashboardPage() {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";

  // We only need the totals, so request a single row per resource.
  const countParams = { page: 1, pageSize: 1 };
  const board = useBoardOfDirectors(countParams);
  const layouts = useLayouts(countParams);
  const admins = useAdmins(countParams, { enabled: isSuperAdmin });

  // Recent notices feed.
  const recent = useNotices({ page: 1, pageSize: 5 });
  const recentNotices: TNotice[] = recent.data?.items ?? [];

  const dash = (value: number | undefined, isLoading: boolean) =>
    isLoading ? "…" : (value ?? 0);

  const quickActions = [
    { to: "/board-of-directors", label: "Board of Directors", icon: UsersIcon },
    { to: "/notices", label: "Notices", icon: MegaphoneIcon },
    { to: "/layouts", label: "Layouts", icon: LayoutTemplateIcon },
    ...(isSuperAdmin
      ? [
          { to: "/branches", label: "Branches", icon: Building2Icon },
          { to: "/admins", label: "Admins", icon: ShieldUserIcon },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Greeting hero */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-accent to-accent/70 p-6 text-accent-foreground shadow-(--card-shadow) sm:p-8">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-16 size-44 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <CalendarIcon className="size-4" />
            <span>{fullDate}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{greeting()}</h1>
          <p className="mt-1 max-w-prose opacity-90">
            Here's an overview of your{" "}
            {isSuperAdmin ? "organization" : "branch"} content.
          </p>
          <Chip
            variant="soft"
            size="sm"
            className="mt-4 bg-white/20 text-white"
          >
            {isSuperAdmin ? "Super Admin" : "Branch Admin"}
          </Chip>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          to="/board-of-directors"
          label="Board members"
          value={dash(board.data?.total, board.isLoading)}
          icon={UsersIcon}
        />
        <StatTile
          to="/notices"
          label="Notices"
          value={dash(recent.data?.total, recent.isLoading)}
          icon={MegaphoneIcon}
        />
        <StatTile
          to="/layouts"
          label="Layouts"
          value={dash(layouts.data?.total, layouts.isLoading)}
          icon={LayoutTemplateIcon}
        />
        {isSuperAdmin ? (
          <StatTile
            to="/admins"
            label="Admins"
            value={dash(admins.data?.total, admins.isLoading)}
            icon={ShieldUserIcon}
          />
        ) : (
          <StatTile
            to="/board-of-directors"
            label="Branch"
            value={admin?.branchId ? `#${admin.branchId}` : "—"}
            icon={Building2Icon}
          />
        )}
      </div>

      {/* Recent notices + quick actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-secondary p-5 shadow-(--card-shadow) lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent notices</h2>
            <Link
              to="/notices"
              search={{ page: 1, pageSize: 10 }}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View all
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {recent.isLoading ? (
              <p className="py-8 text-center text-sm text-muted">Loading…</p>
            ) : recentNotices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No notices yet.
              </p>
            ) : (
              recentNotices.map((notice) => (
                <Link
                  key={notice.id}
                  to="/notices"
                  search={{ page: 1, pageSize: 10, selected: notice.id }}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface-tertiary"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent/15 text-accent">
                    {notice.image ? (
                      <img
                        src={notice.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <MegaphoneIcon className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {notice.title}
                    </p>
                    <p className="text-xs text-muted">
                      {shortDate(notice.createdAt)}
                    </p>
                  </div>
                  <Chip
                    color={notice.isPublished ? "success" : "default"}
                    variant="soft"
                    size="sm"
                  >
                    {notice.isPublished ? "Published" : "Draft"}
                  </Chip>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-secondary p-5 shadow-(--card-shadow)">
          <h2 className="font-semibold text-foreground">Quick actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {quickActions.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 transition-colors hover:border-accent hover:bg-accent/5"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Icon className="size-5" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {label}
                </span>
                <PlusIcon className="size-4 text-muted transition-colors group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
