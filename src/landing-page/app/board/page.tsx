import { BoardArchive } from "@/components/organisms/BoardArchive";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import { getAllBoardOfDirectors, getBranch, getNavTree } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "পরিচালনা পর্ষদ — জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখা",
  description:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ, ঢাকা শাখার পরিচালনা পর্ষদের সম্মানিত কর্মকর্তাবৃন্দ।",
};

/**
 * Full board-of-directors page. Mirrors the home-page chrome (top bar,
 * masthead, nav, footer) and lists every member — reached via "view all
 * members" or the "Board of Directors" nav item.
 */
export default async function BoardPage() {
  const [branch, board, menus] = await Promise.all([
    getBranch(),
    getAllBoardOfDirectors(),
    getNavTree(),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} />
      <main className="flex-1">
        <BoardArchive members={board} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
