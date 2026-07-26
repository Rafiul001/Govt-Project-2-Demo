/**
 * Default copy for a branch's public "About us" section.
 *
 * The landing page ships the same text as its fallback (see `about` in
 * `src/landing-page/lib/i18n.ts`) and renders it whenever a branch has left
 * the matching column blank. The branch editor pre-fills its form with these
 * values so an admin sees the real wording and can edit it instead of facing
 * empty boxes — as soon as they publish, the (possibly unchanged) text is
 * persisted on the branch.
 *
 * `{branch}` is substituted with the branch's name when the section renders,
 * both here and on the landing page, so admin-written copy can use it too.
 *
 * Keep in sync with `dictionaries.*.about` in the landing page's i18n module.
 */

import type { TAboutHighlight } from "../types";

export const ABOUT_DEFAULTS = {
  titleBn: "আমাদের সম্পর্কে",
  titleEn: "About Us",
  subtitleBn:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ জনগণের কল্যাণে নিবেদিত একটি সরকারি প্রতিষ্ঠান।",
  subtitleEn:
    "The National Development Authority is a government institution dedicated to public welfare.",
  introBn:
    "জাতীয় উন্নয়ন কর্তৃপক্ষ-এর {branch} শাখা নাগরিক সেবা সহজীকরণ, উন্নয়ন কার্যক্রম বাস্তবায়ন এবং সরকারি নীতিমালা বাস্তবায়নে গুরুত্বপূর্ণ ভূমিকা পালন করে আসছে। আমরা স্বচ্ছতা ও জবাবদিহিতার সাথে জনগণকে মানসম্মত সেবা প্রদানে অঙ্গীকারবদ্ধ।",
  introEn:
    "The {branch} Branch of the National Development Authority has long played a vital role in simplifying citizen services, implementing development programmes, and carrying out government policies. We are committed to providing quality service to the public with transparency and accountability.",
} as const;

/** The three default highlight cards, in display order. */
export const ABOUT_DEFAULT_HIGHLIGHTS: TAboutHighlight[] = [
  {
    icon: "shield-check",
    titleBn: "স্বচ্ছ ও জবাবদিহিমূলক সেবা",
    titleEn: "Transparent & Accountable Service",
    bodyBn:
      "সিটিজেন চার্টার অনুযায়ী নির্ধারিত সময়ে স্বচ্ছতার সাথে নাগরিক সেবা প্রদান করা হয়।",
    bodyEn:
      "Citizen services are provided transparently within the timeframes set by the Citizen's Charter.",
  },
  {
    icon: "users",
    titleBn: "জনবান্ধব কার্যক্রম",
    titleEn: "People-Friendly Activities",
    bodyBn:
      "জনগণের দোরগোড়ায় সেবা পৌঁছে দিতে শাখা পর্যায়ে নিয়মিত কার্যক্রম পরিচালিত হয়।",
    bodyEn:
      "Regular activities are carried out at the branch level to bring services to people's doorsteps.",
  },
  {
    icon: "building",
    titleBn: "আধুনিক প্রশাসন",
    titleEn: "Modern Administration",
    bodyBn:
      "ই-নথি ও ডিজিটাল সেবার মাধ্যমে দ্রুত ও কার্যকর প্রশাসনিক কার্যক্রম নিশ্চিত করা হয়।",
    bodyEn:
      "Fast and effective administrative operations are ensured through e-Nothi and digital services.",
  },
];

/** How many highlight cards the branch editor exposes. */
export const ABOUT_HIGHLIGHT_COUNT = 3;

/**
 * The saved highlights padded/truncated to exactly `ABOUT_HIGHLIGHT_COUNT`
 * cards, so the editor always renders a fixed set of slots. A branch that has
 * never been configured starts from the defaults.
 */
export function toHighlightSlots(
  saved: TAboutHighlight[] | null | undefined,
): TAboutHighlight[] {
  const source = saved ?? ABOUT_DEFAULT_HIGHLIGHTS;
  return Array.from(
    { length: ABOUT_HIGHLIGHT_COUNT },
    (_, i) => source[i] ?? { icon: "", titleBn: "", titleEn: "", bodyBn: "", bodyEn: "" },
  ).map((card) => ({
    icon: card.icon ?? "",
    titleBn: card.titleBn ?? "",
    titleEn: card.titleEn ?? "",
    bodyBn: card.bodyBn ?? "",
    bodyEn: card.bodyEn ?? "",
  }));
}

/** True when a card carries no text at all — such cards are not published. */
export function isEmptyHighlight(card: TAboutHighlight): boolean {
  return !(
    card.titleBn?.trim() ||
    card.titleEn?.trim() ||
    card.bodyBn?.trim() ||
    card.bodyEn?.trim()
  );
}
