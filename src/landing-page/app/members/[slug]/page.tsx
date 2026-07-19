import { MembersArchive } from "@/components/organisms/MembersArchive";
import { NavBar } from "@/components/organisms/NavBar";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { TopBar } from "@/components/organisms/TopBar";
import {
  getBranch,
  getBranchName,
  getMemberCategories,
  getMembersByCategory,
  getNavTree,
} from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type TPageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<TPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [branchName, categories] = await Promise.all([
    getBranchName(),
    getMemberCategories(),
  ]);
  const category = categories.find((c) => c.slug === slug);
  // Metadata is static per request (no client language) → prefer Bangla, the
  // default site language, falling back to English.
  const categoryName = category?.nameBn ?? category?.nameEn ?? "সদস্যবৃন্দ";
  return {
    title: `${categoryName} — জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখা`,
    description: `জাতীয় উন্নয়ন কর্তৃপক্ষ, ${branchName ?? ""} শাখার ${categoryName} তালিকা।`,
  };
}

/**
 * All members of one dynamic category (`/members/:slug` — players, coaches,
 * officials, …), presented as profile cards like the board page. The branch
 * is resolved from the request subdomain; unknown category slugs 404.
 */
export default async function MemberCategoryPage({
  params,
}: {
  params: Promise<TPageParams>;
}) {
  const { slug } = await params;

  // Branch pages exist only on branch subdomains; the bare domain serves nothing.
  const branchName = await getBranchName();
  if (!branchName) notFound();

  // A subdomain that doesn't match a real branch must 404. The scoped
  // queries use the branch's canonical DB name.
  const branch = await getBranch(branchName);
  if (!branch) notFound();

  const [categories, menus] = await Promise.all([
    getMemberCategories(),
    getNavTree(branch.name),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const members = await getMembersByCategory(category.slug, branch.name);

  return (
    <>
      <TopBar />
      <SiteHeader branch={branch} />
      <NavBar menus={menus} memberCategories={categories} />
      <main className="flex-1">
        <MembersArchive
          category={category}
          members={members}
          branchName={branch?.name ?? branchName}
        />
      </main>
      <SiteFooter branch={branch} />
    </>
  );
}
