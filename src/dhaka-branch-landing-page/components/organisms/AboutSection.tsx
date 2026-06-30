import { SectionHeading } from "@/components/molecules/SectionHeading";
import { ORGANIZATION } from "@/lib/data";
import { Building2, ShieldCheck, Users } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "স্বচ্ছ ও জবাবদিহিমূলক সেবা",
    body: "সিটিজেন চার্টার অনুযায়ী নির্ধারিত সময়ে স্বচ্ছতার সাথে নাগরিক সেবা প্রদান করা হয়।",
  },
  {
    icon: Users,
    title: "জনবান্ধব কার্যক্রম",
    body: "জনগণের দোরগোড়ায় সেবা পৌঁছে দিতে শাখা পর্যায়ে নিয়মিত কার্যক্রম পরিচালিত হয়।",
  },
  {
    icon: Building2,
    title: "আধুনিক প্রশাসন",
    body: "ই-নথি ও ডিজিটাল সেবার মাধ্যমে দ্রুত ও কার্যকর প্রশাসনিক কার্যক্রম নিশ্চিত করা হয়।",
  },
];

/** About / introduction block for the branch. */
export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title="আমাদের সম্পর্কে"
          subtitle={`${ORGANIZATION.nameBn} জনগণের কল্যাণে নিবেদিত একটি সরকারি প্রতিষ্ঠান।`}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="leading-relaxed text-slate-600">
              {ORGANIZATION.nameBn}-এর ঢাকা শাখা নাগরিক সেবা সহজীকরণ, উন্নয়ন
              কার্যক্রম বাস্তবায়ন এবং সরকারি নীতিমালা বাস্তবায়নে গুরুত্বপূর্ণ
              ভূমিকা পালন করে আসছে। আমরা স্বচ্ছতা ও জবাবদিহিতার সাথে জনগণকে
              মানসম্মত সেবা প্রদানে অঙ্গীকারবদ্ধ।
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
