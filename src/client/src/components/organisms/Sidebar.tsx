import { Button } from "@heroui/react";
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
  XIcon,
} from "lucide-react";
import { useEffect, type ComponentType } from "react";
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

/**
 * Left navigation for the admin shell.
 *
 * From `lg` up it is a static column beside the content. Below that — phones
 * and most tablets — a 16rem column would leave almost nothing for the page,
 * so it becomes an off-canvas drawer: hidden by default, slid in over a scrim
 * by the top bar's menu button, and dismissed by the scrim, the close button,
 * Escape, or following any link.
 */
export function Sidebar({
  isOpen,
  onClose,
}: {
  /** Drawer state; ignored at `lg` and up, where the rail is always shown. */
  isOpen: boolean;
  onClose: () => void;
}) {
  const admin = useCurrentAdmin();
  const isSuperAdmin = admin?.adminType === "SUPER_ADMIN";
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Escape closes the drawer, matching the scrim and close button.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Scrim — drawer only; the static rail never needs one. */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        // A closed drawer is also `invisible`, not just translated away: an
        // off-screen-but-visible nav stays in the tab order, so keyboard users
        // would tunnel into links they cannot see. `lg:visible` restores it
        // for the static rail.
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-4 transition-transform duration-200 lg:static lg:h-full lg:visible lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent font-bold text-accent-foreground">
            GP
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label="Close navigation"
            className="ml-auto lg:hidden"
            onPress={onClose}
          >
            <XIcon className="size-5" />
          </Button>
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
                // Following a link inside the drawer must dismiss it, or the
                // destination renders behind the overlay.
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:bg-surface-secondary"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            );
          },
        )}
        </nav>
      </aside>
    </>
  );
}
