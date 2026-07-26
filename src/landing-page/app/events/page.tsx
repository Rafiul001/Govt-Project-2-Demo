import {
  EventsArchive,
  type TEventFilters,
  type TEventWhen,
} from "@/components/organisms/EventsArchive";
import { EventsCalendar } from "@/components/organisms/EventsCalendar";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getEventsForRange,
  getEventsPage,
  getMemberCategories,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

/** How many events one page of the archive holds. */
const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const branchName = await getBranchName();
  return {
    title: `ইভেন্ট — ${branchName ?? ""} শাখা, জাতীয় উন্নয়ন কর্তৃপক্ষ`,
    description: `${branchName ?? ""} শাখার ইভেন্ট ও কার্যক্রমের সময়সূচি।`,
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

/** Today as `YYYY-MM-DD` (local time). */
function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const isDate = (value: string | undefined): value is string =>
  /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

/**
 * Resolves the archive's `when` + explicit `from`/`to` filters into the date
 * window the API is asked for, plus the sort direction.
 *
 * `upcoming` and `past` are just a bound at today, so an explicit date always
 * narrows further (the tighter of the two wins) rather than fighting it.
 * "Upcoming" is sorted soonest-first; everything else newest-first.
 */
function resolveWindow(filters: TEventFilters): {
  from?: string;
  to?: string;
  order: "asc" | "desc";
} {
  const now = today();
  const max = (a?: string, b?: string) => (a && b ? (a > b ? a : b) : (a ?? b));
  const min = (a?: string, b?: string) => (a && b ? (a < b ? a : b) : (a ?? b));

  if (filters.when === "upcoming") {
    return {
      from: max(filters.from || undefined, now),
      to: filters.to || undefined,
      order: "asc",
    };
  }
  if (filters.when === "past") {
    return {
      from: filters.from || undefined,
      to: min(filters.to || undefined, now),
      order: "desc",
    };
  }
  return {
    from: filters.from || undefined,
    to: filters.to || undefined,
    order: "desc",
  };
}

/**
 * Events page.
 *
 * The archive above lists *all* published events of the branch by default —
 * a visitor arriving with no query string sees the complete list, newest
 * first — narrowed by the search/when/date filters and split into pages of
 * nine. Below it, the month calendar keeps its own `?month=` navigation and
 * fetches only that month's events (overlap-matched). Every filter is a
 * backend query param, so the URL fully describes the view.
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    when?: string;
    from?: string;
    to?: string;
    page?: string;
    month?: string;
  }>;
}) {
  const params = await searchParams;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404. The scoped
  // queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const filters: TEventFilters = {
    search: params.search?.trim() ?? "",
    when: (["all", "upcoming", "past"].includes(params.when ?? "")
      ? params.when
      : "all") as TEventWhen,
    from: isDate(params.from) ? params.from : "",
    to: isDate(params.to) ? params.to : "",
  };
  const page = Math.max(1, Number(params.page) || 1);
  const window = resolveWindow(filters);

  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month ?? "")
    ? params.month!
    : currentMonth();
  const { from: monthFrom, to: monthTo } = monthRange(month);

  const [archive, monthEvents, menus, categories] = await Promise.all([
    getEventsPage({
      search: filters.search || undefined,
      from: window.from,
      to: window.to,
      order: window.order,
      page,
      pageSize: PAGE_SIZE,
      name: branch.name,
    }),
    getEventsForRange(monthFrom, monthTo, branch.name),
    getNavTree(branch.name),
    getMemberCategories(),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={categories} />
      <main className="flex-1">
        <EventsArchive
          events={archive.items}
          total={archive.total}
          page={archive.page}
          totalPages={archive.totalPages}
          filters={filters}
          month={params.month === month ? month : undefined}
          branchName={branch.name}
        />
        <div className="mx-auto -mt-8 max-w-7xl px-4 pb-14">
          <EventsCalendar
            events={monthEvents}
            month={month}
            filters={filters}
            page={page}
          />
        </div>
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
