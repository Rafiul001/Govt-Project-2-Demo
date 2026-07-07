import { AboutSection } from "@/components/organisms/AboutSection";
import { BoardOfDirectors } from "@/components/organisms/BoardOfDirectors";
import { ContactSection } from "@/components/organisms/ContactSection";
import { HeroSlider } from "@/components/organisms/HeroSlider";
import { NavBar } from "@/components/organisms/NavBar";
import { NoticeBoard } from "@/components/organisms/NoticeBoard";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  findBranch,
  getBanners,
  getBoardOfDirectors,
  getBranchName,
  getBranches,
  getNavTree,
  getNotices,
} from "@/lib/api";
import { notFound } from "next/navigation";

export default async function Home() {
  // Branch sites exist only on branch subdomains; the apex, www, and raw-IP
  // hosts serve nothing (nginx already 404s them at the edge — this covers
  // direct access to the Next.js port and dev).
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // Resolve the branch before fetching anything scoped to it: a subdomain
  // that doesn't match a real branch (cumillah.example.com with no "Cumillah"
  // branch) must 404, not render an empty shell of the site. The scoped
  // queries below use the branch's canonical DB name, which may be cased
  // differently from the host.
  const branches = await getBranches();
  const branch = findBranch(branches, branchName);
  if (!branch) notFound();

  const [banners, notices, board, menus] = await Promise.all([
    getBanners(branch.name),
    getNotices(branch.name),
    getBoardOfDirectors(branch.name),
    getNavTree(branch.name),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} />
      <main className="flex-1">
        {banners.length > 0 ? (
          <HeroSlider
            banners={banners}
            bannerUrl={branch?.banner ?? null}
            branchName={branch?.name ?? branchName}
          />
        ) : null}
        <AboutSection branchName={branch?.name ?? branchName} />
        <NoticeBoard notices={notices} branches={branches} />
        <BoardOfDirectors members={board} />
        <ContactSection branch={branch} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
