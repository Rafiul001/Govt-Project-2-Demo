import { NavBar } from "@/components/organisms/NavBar";
import { NoticesArchive } from "@/components/organisms/NoticesArchive";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import { getBranch, getBranchName, getNavTree, getNoticesPage } from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const branchName = await getBranchName();
  return {
    title: `সকল নোটিশ — জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখা`,
    description: `জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখার প্রকাশিত সকল নোটিশ ও বিজ্ঞপ্তি।`,
  };
}

/** Notices shown per archive page. */
const PAGE_SIZE = 10;

/**
 * Full notice archive. Mirrors the home-page chrome (top bar, masthead, nav,
 * footer). Search and pagination live in the query string (`?search=`,
 * `?page=`) and are applied by the API, so the URL is shareable and each
 * request fetches only one page. A `?id=` query pre-selects a notice (e.g.
 * when clicked on the home page).
 */
export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; search?: string; page?: string }>;
}) {
  const { id, search, page } = await searchParams;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404, not render an
  // empty archive. The scoped queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const parsedPage = page ? Number(page) : 1;
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const searchTerm = search?.trim() || undefined;

  const [noticesPage, menus] = await Promise.all([
    getNoticesPage({
      search: searchTerm,
      page: currentPage,
      pageSize: PAGE_SIZE,
      name: branch.name,
    }),
    getNavTree(branch.name),
  ]);

  const parsedId = id ? Number(id) : NaN;
  const initialNoticeId = Number.isFinite(parsedId) ? parsedId : null;

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} />
      <main className="flex-1">
        <NoticesArchive
          notices={noticesPage.items}
          total={noticesPage.total}
          page={noticesPage.page}
          totalPages={noticesPage.totalPages}
          search={searchTerm ?? ""}
          initialNoticeId={initialNoticeId}
          branchName={branch?.name ?? branchName}
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
