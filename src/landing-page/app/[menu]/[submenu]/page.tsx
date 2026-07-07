import { DynamicPageContent } from "@/components/organisms/DynamicPageContent";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import { getBranch, getBranchName, getDynamicPage, getNavTree } from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TPageParams = { menu: string; submenu: string };

/**
 * A dynamic, admin-authored page reached at `/:menuSlug/:submenuSlug`. The
 * branch is resolved from the request subdomain; the page is fetched by its
 * menu + sub-menu slugs and 404s unless it exists and is published. Mirrors the
 * site chrome (top bar, masthead, nav, footer) around the banner + Markdown.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<TPageParams>;
}): Promise<Metadata> {
  const { menu, submenu } = await params;
  const page = await getDynamicPage(menu, submenu);
  if (!page) return { title: "পৃষ্ঠা পাওয়া যায়নি" };
  // Metadata is static per request (no client language) → prefer Bangla, the
  // default site language, falling back to English.
  const submenuTitle = page.submenuTitleBn ?? page.submenuTitleEn ?? "";
  const menuTitle = page.menuTitleBn ?? page.menuTitleEn ?? "";
  return { title: `${submenuTitle} — ${menuTitle}` };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<TPageParams>;
}) {
  const { menu, submenu } = await params;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404. The scoped
  // queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const [menus, page] = await Promise.all([
    getNavTree(branch.name),
    getDynamicPage(menu, submenu, branch.name),
  ]);

  if (!page) notFound();

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} />
      <main className="flex-1">
        <DynamicPageContent
          bannerTitleBn={page.bannerTitleBn}
          bannerTitleEn={page.bannerTitleEn}
          bannerImage={page.bannerImage}
          contentBn={page.contentBn}
          contentEn={page.contentEn}
          menuTitleBn={page.menuTitleBn}
          menuTitleEn={page.menuTitleEn}
          submenuTitleBn={page.submenuTitleBn}
          submenuTitleEn={page.submenuTitleEn}
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
