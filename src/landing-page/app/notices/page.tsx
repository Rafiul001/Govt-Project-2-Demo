import { NavBar } from "@/components/organisms/NavBar";
import { NoticesArchive } from "@/components/organisms/NoticesArchive";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import { getAllNotices, getBranch } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "সকল নোটিশ — জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখা",
  description:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখার প্রকাশিত সকল নোটিশ ও বিজ্ঞপ্তি।",
};

/**
 * Full notice archive. Mirrors the home-page chrome (top bar, masthead, nav,
 * footer) and renders every published notice — reached via "view all notices".
 * A `?id=` query pre-selects a notice (e.g. when clicked on the home page).
 */
export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const [{ id }, branch, notices] = await Promise.all([
    searchParams,
    getBranch(),
    getAllNotices(),
  ]);

  const parsedId = id ? Number(id) : NaN;
  const initialNoticeId = Number.isFinite(parsedId) ? parsedId : null;

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar />
      <main className="flex-1">
        <NoticesArchive notices={notices} initialNoticeId={initialNoticeId} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
