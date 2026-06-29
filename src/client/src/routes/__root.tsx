import { Toast } from "@heroui/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useApplyTheme } from "../hooks/useApplyTheme";

function RootComponent() {
  useApplyTheme();

  return (
    <>
      <Outlet />
      <Toast.Provider placement="bottom end" />
    </>
  );
}

export const Route = createRootRoute({ component: RootComponent });
