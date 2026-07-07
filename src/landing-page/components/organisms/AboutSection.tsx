"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { withBranch } from "@/lib/i18n";
import { Building2, ShieldCheck, Users } from "lucide-react";

// Icons line up positionally with `t.about.highlights`.
const HIGHLIGHT_ICONS = [ShieldCheck, Users, Building2];

/** About / introduction block for the branch. */
export function AboutSection({ branchName }: { branchName?: string | null }) {
  const { t } = useLanguage();

  return (
    <section id="about" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading title={t.about.title} subtitle={t.about.subtitle} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="leading-relaxed text-slate-600">
              {withBranch(t.about.intro, branchName)}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {t.about.highlights.map(({ title, body }, i) => {
              const Icon = HIGHLIGHT_ICONS[i] ?? ShieldCheck;
              return (
                <div
                  key={title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-govt-green text-white">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-800">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
