import { NavBar } from "@/components/organisms/NavBar";
import { NoticesArchive } from "@/components/organisms/NoticesArchive";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import { getBranch, getNavTree, getNoticesPage } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "সকল নোটিশ — জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখা",
  description:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখার প্রকাশিত সকল নোটিশ ও বিজ্ঞপ্তি।",
};

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

  const parsedPage = page ? Number(page) : 1;
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const searchTerm = search?.trim() || undefined;

  const [branch, noticesPage, menus] = await Promise.all([
    getBranch(),
    getNoticesPage({ search: searchTerm, page: currentPage, pageSize: PAGE_SIZE }),
    getNavTree(),
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
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
