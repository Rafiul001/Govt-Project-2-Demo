import { AboutSection } from "@/components/organisms/AboutSection";
import { BoardOfDirectors } from "@/components/organisms/BoardOfDirectors";
import { ContactSection } from "@/components/organisms/ContactSection";
import { HeroSlider } from "@/components/organisms/HeroSlider";
import { NavBar } from "@/components/organisms/NavBar";
import { NoticeBoard } from "@/components/organisms/NoticeBoard";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <NavBar />
      <main className="flex-1">
        <HeroSlider />
        <AboutSection />
        <NoticeBoard />
        <BoardOfDirectors />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
