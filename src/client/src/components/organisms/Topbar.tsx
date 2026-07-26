import { Button, Chip } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon, MenuIcon } from "lucide-react";
import { useLogout } from "../../hooks/useAuth";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { ThemeModeToggle } from "../molecules";

/**
 * Top bar: navigation toggle (small screens), role badge, theme toggle, logout.
 *
 * Below `lg` the sidebar is a drawer, so this owns the button that opens it and
 * carries the product name — otherwise the branding would vanish with the rail.
 */
export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const admin = useCurrentAdmin();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: "/login" }),
    });
  };

  return (
    <header className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 sm:gap-3 sm:px-6">
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Open navigation"
        className="lg:hidden"
        onPress={onOpenNav}
      >
        <MenuIcon className="size-5" />
      </Button>
      <span className="text-base font-semibold lg:hidden">Admin Panel</span>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {admin ? (
          // The full role name is long next to everything else on a phone; the
          // short form keeps the badge useful without crowding the bar.
          <Chip color="accent" variant="soft">
            <span className="hidden sm:inline">
              {admin.adminType === "SUPER_ADMIN"
                ? "Super Admin"
                : "Branch Admin"}
            </span>
            <span className="sm:hidden">
              {admin.adminType === "SUPER_ADMIN" ? "Super" : "Branch"}
            </span>
          </Chip>
        ) : null}
        <ThemeModeToggle />
        <Button
          variant="outline"
          size="sm"
          isDisabled={logout.isPending}
          onPress={handleLogout}
        >
          <LogOutIcon className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
