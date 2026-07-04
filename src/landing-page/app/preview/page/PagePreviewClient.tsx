"use client";

import { DynamicPageContent } from "@/components/organisms/DynamicPageContent";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import type { TNavMenu, TPagePreview } from "@/lib/types";
import { useEffect, useState } from "react";

/**
 * Client half of the page preview: receives the draft page via `postMessage`
 * from the dashboard editor and renders it inside the real site chrome. The
 * nav `menus` are fetched server-side for the branch this preview is served
 * on, so the surrounding site is fully browsable — following a menu link
 * leaves the preview and lands on the branch's real pages.
 */

/** Origin allowed to drive the preview — the dashboard. Dev default: Vite :5173. */
const DASHBOARD_ORIGIN =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";

type TPreviewMessage = { type: "page-preview" } & TPagePreview;

export function PagePreviewClient({ menus }: { menus: TNavMenu[] }) {
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
      <NavBar menus={menus} />
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
