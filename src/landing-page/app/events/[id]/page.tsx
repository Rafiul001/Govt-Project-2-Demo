import { EventDetail } from "@/components/organisms/EventDetail";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getEvent,
  getMemberCategories,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TPageParams = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<TPageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const [branchName, event] = await Promise.all([
    getBranchName(),
    getEvent(Number(id)),
  ]);
  // Metadata is static per request (no client language) → prefer Bangla, the
  // default site language, falling back to English.
  const title = event?.titleBn ?? event?.titleEn ?? "ইভেন্ট";
  return {
    title: `${title} — ${branchName ?? ""} শাখা, জাতীয় উন্নয়ন কর্তৃপক্ষ`,
    description:
      event?.descriptionBn ??
      event?.descriptionEn ??
      `${branchName ?? ""} শাখার ইভেন্ট।`,
  };
}

/**
 * A single published event (`/events/:id`). The API already hides drafts from
 * anonymous callers, so an unknown *or* unpublished id 404s here; an event
 * belonging to a different branch is rejected too, since the route is global
 * while each host serves exactly one branch.
 */
export default async function EventDetailPage({
  params,
}: {
  params: Promise<TPageParams>;
}) {
  const { id } = await params;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const event = await getEvent(Number(id));
  if (!event || event.branchId !== branch.id) notFound();

  const [menus, categories] = await Promise.all([
    getNavTree(branch.name),
    getMemberCategories(),
  ]);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={categories} />
      <main className="flex-1">
        <EventDetail event={event} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
