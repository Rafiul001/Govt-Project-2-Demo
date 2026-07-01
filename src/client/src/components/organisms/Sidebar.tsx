import { Link } from "@tanstack/react-router";
import {
  Building2Icon,
  GalleryHorizontalIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  MegaphoneIcon,
  SettingsIcon,
  ShieldUserIcon,
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
};

const NAV_ITEMS: TNavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  {
    to: "/branches",
    label: "Branches",
    icon: Building2Icon,
    superAdminOnly: true,
  },
  { to: "/board-of-directors", label: "Board of Directors", icon: UsersIcon },
  { to: "/banners", label: "Banners", icon: GalleryHorizontalIcon },
  { to: "/menus", label: "Menus & Pages", icon: ListTreeIcon },
  { to: "/notices", label: "Notices", icon: MegaphoneIcon },
  {
    to: "/admins",
    label: "Admins",
    icon: ShieldUserIcon,
    superAdminOnly: true,
  },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

/** Fixed left navigation for the admin shell. */
export function Sidebar() {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";

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
          ({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              activeProps={{
                className: "bg-accent text-accent-foreground",
              }}
              inactiveProps={{
                className: "text-muted hover:bg-surface-secondary",
              }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ),
        )}
      </nav>
    </aside>
  );
}
