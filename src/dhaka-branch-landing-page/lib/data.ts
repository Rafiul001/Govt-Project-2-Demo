/**
 * Static site configuration that does not live in the database.
 *
 * The backend models *branches* (+ their notices and board of directors), not
 * the parent organization, so the organization identity and the standard
 * "important links" block are configured here. All branch-specific content
 * (name, logo, banner, address, notices, board members) is fetched live from
 * the API — see `lib/api.ts`.
 */

/** Organization the portal belongs to. Shown in the masthead and footer. */
export const ORGANIZATION = {
  govLineBn: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
  govLineEn: "Government of the People's Republic of Bangladesh",
  nameBn: "জাতীয় উন্নয়ন কর্তৃপক্ষ",
  nameEn: "National Development Authority",
} as const;

/** National e-government links shown on every Bangladesh govt portal. */
export const importantLinks: { label: string; href: string }[] = [
  { label: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", href: "https://bangladesh.gov.bd" },
  { label: "মাইগভ (MyGov)", href: "https://mygov.bd" },
  { label: "ই-নথি", href: "https://www.nothi.gov.bd" },
  { label: "অভিযোগ প্রতিকার ব্যবস্থা (GRS)", href: "https://grs.gov.bd" },
  { label: "ই-টেন্ডারিং", href: "https://www.eprocure.gov.bd" },
];
