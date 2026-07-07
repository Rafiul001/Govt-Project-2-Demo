import { AboutSection } from "@/components/organisms/AboutSection";
import { BoardOfDirectors } from "@/components/organisms/BoardOfDirectors";
import { BranchDirectory } from "@/components/organisms/BranchDirectory";
import { ContactSection } from "@/components/organisms/ContactSection";
import { HeroSlider } from "@/components/organisms/HeroSlider";
import { NavBar } from "@/components/organisms/NavBar";
import { NoticeBoard } from "@/components/organisms/NoticeBoard";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBanners,
  getBoardOfDirectors,
  getBranch,
  getBranchName,
  getBranches,
  getNavTree,
  getNotices,
} from "@/lib/api";
import { headers } from "next/headers";

export default async function Home() {
  const branchName = await getBranchName();

  // No branch subdomain (apex, www, raw IP) → branch sites are only served on
  // their subdomains, so list the branches instead of rendering one.
  if (!branchName) {
    const [branches, headerList] = await Promise.all([
      getBranches(),
      headers(),
    ]);
    // `www.` must not leak into the generated subdomain links.
    const host = (headerList.get("host") ?? "").replace(/^www\./, "");

    return (
      <>
        <TopBar />
        <SiteHeader branch={null} />
        <main className="flex-1">
          <BranchDirectory
            branches={branches.filter((b) => b.isPublished)}
            host={host}
          />
        </main>
        <SiteFooter branch={null} />
      </>
    );
  }

  const [branch, branches, banners, notices, board, menus] = await Promise.all([
    getBranch(branchName),
    getBranches(),
    getBanners(branchName),
    getNotices(branchName),
    getBoardOfDirectors(branchName),
    getNavTree(branchName),
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
