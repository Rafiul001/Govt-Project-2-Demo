/**
 * Static site configuration that does not live in the database.
 *
 * The backend models *branches* (+ their notices and board of directors), not
 * the parent organization, so the organization identity and the standard
 * "important links" block are configured here. All branch-specific content
 * (name, logo, banner, address, notices, board members) is fetched live from
 * the API — see `lib/api.ts`.
 */

/**
 * Organization identity (name + national-government line) now lives in the
 * bilingual catalogue — see `org` in `lib/i18n.ts`.
 */

/** National e-government links shown on every Bangladesh govt portal. */
export const importantLinks: {
  labelBn: string;
  labelEn: string;
  href: string;
}[] = [
  {
    labelBn: "বাংলাদেশ জাতীয় তথ্য বাতায়ন",
    labelEn: "Bangladesh National Web Portal",
    href: "https://bangladesh.gov.bd",
  },
  { labelBn: "মাইগভ (MyGov)", labelEn: "MyGov", href: "https://mygov.bd" },
  { labelBn: "ই-নথি", labelEn: "e-Nothi", href: "https://www.nothi.gov.bd" },
  {
    labelBn: "অভিযোগ প্রতিকার ব্যবস্থা (GRS)",
    labelEn: "Grievance Redress System (GRS)",
    href: "https://grs.gov.bd",
  },
  {
    labelBn: "ই-টেন্ডারিং",
    labelEn: "e-Tendering",
    href: "https://www.eprocure.gov.bd",
  },
];
