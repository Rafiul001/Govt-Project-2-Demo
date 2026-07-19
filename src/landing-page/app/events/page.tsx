import { EventsCalendar } from "@/components/organisms/EventsCalendar";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getEventsForRange,
  getMemberCategories,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const branchName = await getBranchName();
  return {
    title: `ইভেন্ট ক্যালেন্ডার — জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখা`,
    description: `জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখার ইভেন্ট ও কার্যক্রমের সময়সূচি।`,
  };
}

/** `YYYY-MM` of the current month (local time). */
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** First/last day (`YYYY-MM-DD`) of a `YYYY-MM` month. */
function monthRange(month: string): { from: string; to: string } {
  const [year, monthNum] = month.split("-").map(Number) as [number, number];
  const lastDay = new Date(year, monthNum, 0).getDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

/**
 * Event calendar page. The displayed month lives in `?month=YYYY-MM` (the
 * prev/next controls are plain links), and only that month's events are
 * fetched — overlap-matched, so multi-day events appear in every month they
 * touch.
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404. The scoped
  // queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? "")
    ? monthParam!
    : currentMonth();
  const { from, to } = monthRange(month);

  const [events, menus, categories] = await Promise.all([
    getEventsForRange(from, to, branch.name),
    getNavTree(branch.name),
    getMemberCategories(),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={categories} />
      <main className="flex-1">
        <EventsCalendar
          events={events}
          month={month}
          branchName={branch?.name ?? branchName}
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
