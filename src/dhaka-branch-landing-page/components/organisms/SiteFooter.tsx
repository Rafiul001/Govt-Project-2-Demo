import { importantLinks, ORGANIZATION } from "@/lib/data";
import { toBanglaDigits } from "@/lib/format";
import type { TBranch } from "@/lib/types";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

/** Dark-green footer with contact, quick links, and copyright. */
export function SiteFooter({ branch }: { branch: TBranch | null }) {
  const year = toBanglaDigits(new Date().getFullYear());

  return (
    <footer className="bg-govt-green-dark text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Identity */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/national-emblem.svg"
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 brightness-0 invert"
            />
            <div>
              <p className="font-bold text-white">{ORGANIZATION.nameBn}</p>
              {branch ? (
                <p className="text-sm text-slate-300">{branch.name} শাখা</p>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            জনগণের কল্যাণে স্বচ্ছ, জবাবদিহিমূলক ও মানসম্মত সেবা প্রদানে আমরা
            অঙ্গীকারবদ্ধ।
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 font-semibold text-white">যোগাযোগ</h3>
          <ul className="space-y-3 text-sm">
            {branch?.address ? (
              <li className="flex gap-2">
                <MapPin className="size-4 shrink-0 text-govt-red" aria-hidden />
                <span>{branch.address}</span>
              </li>
            ) : null}
            {branch?.phone ? (
              <li className="flex gap-2">
                <Phone className="size-4 shrink-0 text-govt-red" aria-hidden />
                <span>{branch.phone}</span>
              </li>
            ) : null}
            {branch?.email ? (
              <li className="flex gap-2">
                <Mail className="size-4 shrink-0 text-govt-red" aria-hidden />
                <span>{branch.email}</span>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-4 font-semibold text-white">গুরুত্বপূর্ণ লিংক</h3>
          <ul className="space-y-2 text-sm">
            {importantLinks.slice(0, 5).map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-slate-300 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div>
          <h3 className="mb-4 font-semibold text-white">দ্রুত প্রবেশ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#about" className="text-slate-300 hover:text-white">
                আমাদের সম্পর্কে
              </a>
            </li>
            <li>
              <a href="#notices" className="text-slate-300 hover:text-white">
                নোটিশ বোর্ড
              </a>
            </li>
            <li>
              <a href="#board" className="text-slate-300 hover:text-white">
                পরিচালনা পর্ষদ
              </a>
            </li>
            <li>
              <a href="#contact" className="text-slate-300 hover:text-white">
                যোগাযোগ
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
          <p>
            © {year} {ORGANIZATION.nameBn}
            {branch ? `, ${branch.name} শাখা` : ""}। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p>{ORGANIZATION.govLineBn}</p>
        </div>
      </div>
    </footer>
  );
}
