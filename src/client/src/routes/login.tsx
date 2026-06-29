import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../components/pages";
import { useAuthStore } from "../store/auth.store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (useAuthStore.getState().accessToken) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
