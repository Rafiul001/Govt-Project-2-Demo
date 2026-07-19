import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2Icon,
  CalendarDaysIcon,
  ContactIcon,
  GalleryHorizontalIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  MegaphoneIcon,
  SettingsIcon,
  ShieldUserIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";

type TNavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  superAdminOnly?: boolean;
  /** Extra path prefixes (editor routes) that keep this item highlighted. */
  activePrefixes?: string[];
};

const NAV_ITEMS: TNavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  {
    to: "/branches",
    label: "Branches",
    icon: Building2Icon,
    superAdminOnly: true,
    activePrefixes: ["/branch"],
  },
  { to: "/board-of-directors", label: "Board of Directors", icon: UsersIcon },
  {
    to: "/members",
    label: "Members",
    icon: ContactIcon,
    activePrefixes: ["/member"],
  },
  {
    to: "/member-categories",
    label: "Member Categories",
    icon: TagsIcon,
    superAdminOnly: true,
  },
  {
    to: "/events",
    label: "Events",
    icon: CalendarDaysIcon,
    activePrefixes: ["/event"],
  },
  { to: "/banners", label: "Banners", icon: GalleryHorizontalIcon },
  {
    to: "/menus",
    label: "Menus & Pages",
    icon: ListTreeIcon,
    activePrefixes: ["/pages"],
  },
  { to: "/notices", label: "Notices", icon: MegaphoneIcon },
  {
    to: "/admins",
    label: "Admins",
    icon: ShieldUserIcon,
    superAdminOnly: true,
  },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

/** Whether `pathname` is `prefix` itself or a sub-path of it. */
function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Fixed left navigation for the admin shell. */
export function Sidebar() {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface p-4">
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="grid size-9 place-items-center rounded-lg bg-accent font-bold text-accent-foreground">
          GP
        </div>
        <span className="text-lg font-semibold">Admin Panel</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin).map(
          ({ to, label, icon: Icon, exact, activePrefixes }) => {
            // Active state is computed from the pathname (not the Link's own
            // matching) so editor routes living outside the item's path — e.g.
            // /pages/:id/edit under "Menus & Pages" — keep it highlighted.
            const isActive = exact
              ? pathname === to
              : [to, ...(activePrefixes ?? [])].some((prefix) =>
                  matchesPrefix(pathname, prefix),
                );
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:bg-surface-secondary"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          },
        )}
      </nav>
    </aside>
  );
}
