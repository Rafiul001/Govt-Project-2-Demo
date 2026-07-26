import { MemberDetail } from "@/components/organisms/MemberDetail";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getMember,
  getMemberCategories,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TPageParams = { slug: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<TPageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const [branchName, member] = await Promise.all([
    getBranchName(),
    getMember(Number(id)),
  ]);
  // Metadata is static per request (no client language) → prefer Bangla, the
  // default site language, falling back to English.
  const name = member?.nameBn ?? member?.nameEn ?? "সদস্য";
  return {
    title: `${name} — ${branchName ?? ""} শাখা, জাতীয় উন্নয়ন কর্তৃপক্ষ`,
    description: `${branchName ?? ""} শাখার সদস্য ${name}-এর প্রোফাইল।`,
  };
}

/**
 * Public profile of one member (`/members/:slug/:id`).
 *
 * The id is checked against *both* the current branch and the category in the
 * URL: the member route is global, so without this a profile from another
 * branch — or filed under a different category — would render here. Private
 * fields are already blanked out by the API for anonymous callers, per the
 * member's own "Public profile" configuration.
 */
export default async function MemberDetailPage({
  params,
}: {
  params: Promise<TPageParams>;
}) {
  const { slug, id } = await params;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const [categories, menus, member] = await Promise.all([
    getMemberCategories(),
    getNavTree(branch.name),
    getMember(Number(id)),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  if (
    !member ||
    member.branchId !== branch.id ||
    member.categoryId !== category.id
  ) {
    notFound();
  }

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={categories} />
      <main className="flex-1">
        <MemberDetail member={member} category={category} />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
