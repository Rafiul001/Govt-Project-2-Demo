"use client";

import { DynamicPageContent } from "@/components/organisms/DynamicPageContent";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import type { TPagePreview } from "@/lib/types";
import { useEffect, useState } from "react";

/**
 * Live preview of a dynamic page, embedded as an iframe by the dashboard page
 * editor (`/pages/:submenuId/edit`). It renders the same public chrome and
 * `DynamicPageContent` as the real page, but the data is pushed in live via
 * `postMessage` as the editor's form changes — so unsaved edits (including a
 * freshly picked banner image, arriving as a data URL) are visible before
 * publishing.
 *
 * Like the branch preview, this route is only meant to be embedded by the
 * dashboard: it renders nothing until a payload arrives, so a direct visit
 * shows a blank page.
 */

/** Origin allowed to drive the preview — the dashboard. Dev default: Vite :5173. */
const DASHBOARD_ORIGIN =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";

type TPreviewMessage = { type: "page-preview" } & TPagePreview;

export default function PagePreview() {
  const [preview, setPreview] = useState<TPagePreview | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== DASHBOARD_ORIGIN) return;
      const data = event.data as TPreviewMessage | undefined;
      if (data?.type === "page-preview" && data.branch && data.page) {
        setPreview({
          branch: data.branch,
          menuTitleBn: data.menuTitleBn,
          menuTitleEn: data.menuTitleEn,
          submenuTitleBn: data.submenuTitleBn,
          submenuTitleEn: data.submenuTitleEn,
          page: data.page,
        });
      }
    }

    window.addEventListener("message", onMessage);
    // Announce readiness so the editor (re)sends the current values — covers the
    // race where the editor's first post happens before this listener attaches.
    window.parent.postMessage({ type: "preview-ready" }, DASHBOARD_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // No payload yet (initial load or a direct visit) → render nothing.
  if (!preview) return null;

  return (
    <>
      <TopBar />
      <SiteHeader branch={preview.branch} />
      <NavBar />
      <main className="flex-1">
        <DynamicPageContent
          bannerTitleBn={preview.page.bannerTitleBn}
          bannerTitleEn={preview.page.bannerTitleEn}
          bannerImage={preview.page.bannerImage}
          contentBn={preview.page.contentBn}
          contentEn={preview.page.contentEn}
          menuTitleBn={preview.menuTitleBn}
          menuTitleEn={preview.menuTitleEn}
          submenuTitleBn={preview.submenuTitleBn}
          submenuTitleEn={preview.submenuTitleEn}
        />
      </main>
      <SiteFooter branch={preview.branch} />
    </>
  );
}
