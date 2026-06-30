import { ContactRow } from "@/components/molecules/ContactRow";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { branch } from "@/lib/data";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

/** Contact block: branch address / phone / email + an embedded location map. */
export function ContactSection() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    branch.address,
  )}&output=embed`;

  return (
    <section id="contact" className="scroll-mt-20 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title="যোগাযোগ"
          subtitle="যেকোনো প্রয়োজনে নিচের ঠিকানায় আমাদের সাথে যোগাযোগ করুন।"
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <ContactRow icon={MapPin} label="ঠিকানা" value={branch.address} />
            {branch.phone ? (
              <ContactRow
                icon={Phone}
                label="ফোন"
                value={branch.phone}
                href={`tel:${branch.phone.replace(/\s/g, "")}`}
              />
            ) : null}
            {branch.email ? (
              <ContactRow
                icon={Mail}
                label="ইমেইল"
                value={branch.email}
                href={`mailto:${branch.email}`}
              />
            ) : null}
            <ContactRow
              icon={Clock}
              label="অফিস সময়"
              value="রবি – বৃহস্পতি, সকাল ৯টা – বিকাল ৪টা (সরকারি ছুটি ব্যতীত)"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <iframe
              title="অবস্থান মানচিত্র"
              src={mapSrc}
              className="h-full min-h-[20rem] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
