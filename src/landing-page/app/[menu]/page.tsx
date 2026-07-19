import { DynamicPageContent } from "@/components/organisms/DynamicPageContent";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getDynamicPage,
  getMemberCategories,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TPageParams = { menu: string };

/**
 * A dynamic, admin-authored page attached directly to a menu, reached at
 * `/:menuSlug` (menus without sub-menus link straight to their page). The
 * branch is resolved from the request subdomain; 404s unless the page exists
 * and is published. Static routes (`/notices`, `/board`, `/preview`) take
 * precedence over this segment.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<TPageParams>;
}): Promise<Metadata> {
  const { menu } = await params;
  const page = await getDynamicPage(menu);
  if (!page) return { title: "পৃষ্ঠা পাওয়া যায়নি" };
  // Metadata is static per request (no client language) → prefer Bangla, the
  // default site language, falling back to English.
  return { title: page.menuTitleBn ?? page.menuTitleEn ?? "" };
}

export default async function DirectMenuPage({
  params,
}: {
  params: Promise<TPageParams>;
}) {
  const { menu } = await params;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404. The scoped
  // queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const [menus, page, memberCategories] = await Promise.all([
    getNavTree(branch.name),
    getDynamicPage(menu, null, branch.name),
    getMemberCategories(),
  ]);

  if (!page) notFound();

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={memberCategories} />
      <main className="flex-1">
        <DynamicPageContent
          bannerTitleBn={page.bannerTitleBn}
          bannerTitleEn={page.bannerTitleEn}
          bannerImage={page.bannerImage}
          contentBn={page.contentBn}
          contentEn={page.contentEn}
          menuTitleBn={page.menuTitleBn}
          menuTitleEn={page.menuTitleEn}
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
