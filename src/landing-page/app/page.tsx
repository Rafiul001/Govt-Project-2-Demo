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
  getBanners,
  getBoardOfDirectors,
  getBranch,
  getBranches,
  getNavTree,
  getNotices,
} from "@/lib/api";

export default async function Home() {
  const [branch, branches, banners, notices, board, menus] = await Promise.all([
    getBranch(),
    getBranches(),
    getBanners(),
    getNotices(),
    getBoardOfDirectors(),
    getNavTree(),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} />
      <main className="flex-1">
        {banners.length > 0 ? (
          <HeroSlider banners={banners} bannerUrl={branch?.banner ?? null} />
        ) : null}
        <AboutSection />
        <NoticeBoard notices={notices} branches={branches} />
        <BoardOfDirectors members={board} />
        <ContactSection branch={branch} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
