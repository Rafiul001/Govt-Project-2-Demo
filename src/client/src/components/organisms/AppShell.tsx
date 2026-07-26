import { useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Authenticated layout: navigation + top bar + scrollable content.
 *
 * The navigation is a static rail from `lg` up and an off-canvas drawer below
 * it (see `Sidebar`); this owns the open/closed state because both the drawer
 * and the top bar's menu button need it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [isNavOpen, setNavOpen] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Close the drawer on navigation. Link clicks close it themselves, but this
  // also covers programmatic navigation (a form redirecting after save) and
  // browser back/forward. Adjusted during render rather than in an effect —
  // the same pattern the list filters use — so the new route never paints with
  // the drawer still over it.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    setNavOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isNavOpen} onClose={() => setNavOpen(false)} />
      {/*
        `min-w-0` is load-bearing: without it this flex child refuses to shrink
        below its content's intrinsic width, so wide children (tables, long
        headings) push the column past the viewport instead of scrolling or
        wrapping inside it.
      */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-(--app-canvas) p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
