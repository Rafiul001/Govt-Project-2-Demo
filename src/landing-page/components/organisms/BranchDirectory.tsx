"use client";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { TBranch } from "@/lib/types";
import { Building2, MapPin } from "lucide-react";
import Image from "next/image";

/**
 * Branch directory, rendered at the apex domain (and `www`) where no branch
 * subdomain is present. Branch sites are only served on their subdomains
 * (`dhaka.example.com`), so the bare domain lists every branch and links out
 * to them instead of rendering one by default.
 */
export function BranchDirectory({
  branches,
  host,
}: {
  branches: TBranch[];
  host: string;
}) {
  const { t } = useLanguage();

  /** Branch site URL: the saved preview URL, or `sub.host` derived from it. */
  const branchHref = (branch: TBranch): string =>
    branch.previewUrl || `//${branch.name.toLowerCase()}.${host}`;

  return (
    <section className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title={t.directory.title}
          subtitle={t.directory.subtitle}
        />

        {branches.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <a
                key={branch.id}
                href={branchHref(branch)}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {branch.logo ? (
                    <Image
                      src={branch.logo}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-full bg-govt-green text-white">
                      <Building2 className="size-5.5" aria-hidden />
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-govt-green">
                      {branch.name}
                    </h3>
                    {branch.address ? (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        {branch.address}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-govt-green">
                  {t.directory.visit}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            {t.directory.empty}
          </div>
        )}
      </div>
    </section>
  );
}
