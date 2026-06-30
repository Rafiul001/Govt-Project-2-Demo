import { NoticeItem } from "@/components/molecules/NoticeItem";
import { QuickLink } from "@/components/molecules/QuickLink";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { importantLinks } from "@/lib/data";
import type { TNotice } from "@/lib/types";

/**
 * Notice board + important links — the two-column centrepiece of nearly every
 * Bangladesh govt portal. Notices come from the API (already published-only).
 */
export function NoticeBoard({ notices }: { notices: TNotice[] }) {
  const published = notices.filter((n) => n.isPublished);

  return (
    <section id="notices" className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
        {/* Notices */}
        <div className="lg:col-span-2">
          <SectionHeading title="নোটিশ বোর্ড" />
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-2 shadow-sm">
            {published.length > 0 ? (
              published.map((notice) => (
                <NoticeItem key={notice.id} notice={notice} />
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                এই মুহূর্তে প্রকাশিত কোনো নোটিশ নেই।
              </p>
            )}
          </div>
          <div className="mt-4 text-right">
            <a
              href="#"
              className="text-sm font-semibold text-govt-green hover:underline"
            >
              সকল নোটিশ দেখুন →
            </a>
          </div>
        </div>

        {/* Important links */}
        <aside>
          <SectionHeading title="গুরুত্বপূর্ণ লিংক" />
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            {importantLinks.map((link) => (
              <QuickLink key={link.label} label={link.label} href={link.href} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
