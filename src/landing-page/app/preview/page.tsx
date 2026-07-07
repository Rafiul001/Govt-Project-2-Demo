"use client";

import { AboutSection } from "@/components/organisms/AboutSection";
import { BoardOfDirectors } from "@/components/organisms/BoardOfDirectors";
import { ContactSection } from "@/components/organisms/ContactSection";
import { HeroSlider } from "@/components/organisms/HeroSlider";
import { NavBar } from "@/components/organisms/NavBar";
import { NoticeBoard } from "@/components/organisms/NoticeBoard";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import type { TBranch } from "@/lib/types";
import { useEffect, useState } from "react";

/**
 * Live preview of a branch's public site, embedded as an iframe by the
 * dashboard branch editor (`/branch/:id/edit`). It renders the same public
 * organisms as the real landing page, but the branch data is pushed in live via
 * `postMessage` as the editor's form changes — so unsaved edits are visible
 * before publishing. Logo/banner images arrive as data URLs (they can't be
 * blob URLs across origins) and render directly.
 *
 * The full landing layout is rendered so the editor shows a faithful page.
 * Branch-profile sections (header, hero, about, contact, footer) reflect the
 * live edits; the notice board and board-of-directors sections are shown as
 * layout (empty state) since those are managed separately, not in this editor.
 *
 * This route is *only* meant to be embedded by the dashboard editor — it is not
 * a viewable public page. It renders nothing until a branch arrives via
 * `postMessage` from the dashboard origin, and a direct visitor never receives
 * one, so opening it directly just shows a blank page.
 */

/** Origin allowed to drive the preview — the dashboard. Dev default: Vite :5173. */
const DASHBOARD_ORIGIN =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";

type TPreviewMessage = { type: "branch-preview"; branch: TBranch };

export default function PreviewPage() {
  // Starts `null` so nothing renders until the editor pushes the first branch
  // payload — otherwise a placeholder name would flash (e.g. "Preview শাখা")
  // before the real branch arrives.
  const [branch, setBranch] = useState<TBranch | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== DASHBOARD_ORIGIN) return;
      const data = event.data as TPreviewMessage | undefined;
      if (data?.type === "branch-preview" && data.branch) {
        setBranch(data.branch);
      }
    }

    window.addEventListener("message", onMessage);
    // Announce readiness so the editor (re)sends the current branch — covers the
    // race where the editor's first post happens before this listener attaches.
    window.parent.postMessage({ type: "preview-ready" }, DASHBOARD_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // No branch received yet (initial load or a direct visit) → render nothing.
  if (!branch) return null;

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar />
      <main className="flex-1">
        <HeroSlider
          banners={[]}
          bannerUrl={branch.banner}
          branchName={branch.name}
        />
        <AboutSection branchName={branch.name} />
        <NoticeBoard notices={[]} branches={[branch]} />
        <BoardOfDirectors members={[]} />
        <ContactSection branch={branch} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
