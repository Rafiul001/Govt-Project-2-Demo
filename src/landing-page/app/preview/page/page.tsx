import { getNavTree } from "@/lib/api";
import { PagePreviewClient } from "./PagePreviewClient";

/**
 * Live preview of a dynamic page, embedded as an iframe by the dashboard page
 * editor (`/pages/:submenuId/edit`). The dashboard embeds it on the *branch's*
 * host (e.g. `barishal.localhost:3001`), so the nav tree fetched here is the
 * branch's real published navigation — the preview behaves like the full
 * landing site, with the draft page's content pushed in live via `postMessage`
 * (see `PagePreviewClient`). Unsaved edits, including a freshly picked banner
 * image arriving as a data URL, are visible before publishing.
 *
 * This route is only meant to be embedded by the dashboard: it renders nothing
 * until a payload arrives, so a direct visit shows a blank page.
 */
export default async function PagePreview() {
  const menus = await getNavTree();
  return <PagePreviewClient menus={menus} />;
}
