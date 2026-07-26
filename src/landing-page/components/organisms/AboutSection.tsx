"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { pickLang, withBranch, type TLanguage } from "@/lib/i18n";
import type { TAboutHighlight, TBranch } from "@/lib/types";
import {
  Award,
  Building2,
  FileText,
  Globe,
  Handshake,
  Heart,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon key → component, matching `aboutHighlightIcons` in the shared branch
 * validator. The dashboard's branch editor offers exactly these keys, so a
 * card looks the same in the editor's preview and on the live site.
 */
const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  users: Users,
  building: Building2,
  landmark: Landmark,
  award: Award,
  scale: Scale,
  handshake: Handshake,
  globe: Globe,
  "file-text": FileText,
  heart: Heart,
  sparkles: Sparkles,
  target: Target,
};

/** Icons used by the built-in default cards, positionally. */
const DEFAULT_ICONS: LucideIcon[] = [ShieldCheck, Users, Building2];

/**
 * The branch's own bilingual value for a field, falling back to the built-in
 * catalogue text when the admin has left both languages blank. `{branch}` is
 * substituted in either source, so admin-written copy can use it too.
 */
function aboutText(
  lang: TLanguage,
  bn: string | null | undefined,
  en: string | null | undefined,
  fallback: string,
  branchName: string | null | undefined,
): string {
  const picked = pickLang(lang, bn, en);
  return withBranch(picked.trim() ? picked : fallback, branchName);
}

/** The cards to render: the branch's own, or the built-in defaults. */
function resolveHighlightCards(
  branch: TBranch | null | undefined,
  lang: TLanguage,
  defaults: { title: string; body: string }[],
): { title: string; body: string; Icon: LucideIcon }[] {
  const saved = branch?.aboutHighlights;

  // `null` means the branch was never configured → show the defaults. An empty
  // array is a deliberate "no cards" and is respected as such.
  if (!saved) {
    return defaults.map((card, i) => ({
      ...card,
      Icon: DEFAULT_ICONS[i] ?? ShieldCheck,
    }));
  }

  return saved.map((card: TAboutHighlight, i) => ({
    title: pickLang(lang, card.titleBn, card.titleEn),
    body: pickLang(lang, card.bodyBn, card.bodyEn),
    Icon:
      HIGHLIGHT_ICONS[card.icon ?? ""] ?? DEFAULT_ICONS[i] ?? ShieldCheck,
  }));
}

/**
 * About / introduction block for the branch.
 *
 * All of the copy is editable per branch in the dashboard's branch editor; any
 * field the admin leaves blank falls back to the shared default text in
 * `lib/i18n.ts`, so a freshly created branch still reads sensibly.
 */
export function AboutSection({
  branch,
  branchName,
}: {
  branch?: TBranch | null;
  /** Name used for `{branch}` substitution; defaults to the branch's own. */
  branchName?: string | null;
}) {
  const { lang, t } = useLanguage();
  const name = branchName ?? branch?.name ?? null;

  const title = aboutText(
    lang,
    branch?.aboutTitleBn,
    branch?.aboutTitleEn,
    t.about.title,
    name,
  );
  const subtitle = aboutText(
    lang,
    branch?.aboutSubtitleBn,
    branch?.aboutSubtitleEn,
    t.about.subtitle,
    name,
  );
  const intro = aboutText(
    lang,
    branch?.aboutIntroBn,
    branch?.aboutIntroEn,
    t.about.intro,
    name,
  );

  const cards = resolveHighlightCards(branch, lang, t.about.highlights);

  return (
    <section id="about" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading title={title} subtitle={subtitle} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="whitespace-pre-line leading-relaxed text-slate-600">
              {intro}
            </p>
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
              {cards.map(({ title: cardTitle, body, Icon }, i) => (
                <div
                  key={`${cardTitle}-${i}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-govt-green text-white">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-800">
                    {withBranch(cardTitle, name)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {withBranch(body, name)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
