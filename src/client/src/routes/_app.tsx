import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/organisms";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
