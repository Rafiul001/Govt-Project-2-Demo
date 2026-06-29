import { Button, Chip } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import { useLogout } from "../../hooks/useAuth";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { ThemeModeToggle } from "../molecules";

/** Top bar: role badge, theme toggle, and logout. */
export function Topbar() {
  const admin = useCurrentAdmin();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: "/login" }),
    });
  };

  return (
    <header className="flex items-center justify-end gap-3 border-b border-(--border) bg-(--surface) px-6 py-3">
      {admin ? (
        <Chip color="accent" variant="soft">
          {admin.adminType === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"}
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
        Logout
      </Button>
    </header>
  );
}
