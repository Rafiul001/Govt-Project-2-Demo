/**
 * Representative content for the Dhaka branch public site.
 *
 * The backend API (`src/server`) currently exposes no public routes — every
 * router is behind `authMiddleware`. Until a public read endpoint exists, the
 * landing page renders this static data, which is shaped exactly like the API
 * response envelope (`{ items, ... }` / entity objects). When a public
 * `GET /api/v1/public/...` lands, replace these constants with `fetch` calls.
 */

import type { TBoardOfDirector, TBranch, TNotice } from "./types";

const BRANCH_ID = 1;

/** Organization the portal belongs to. Shown in the masthead. */
export const ORGANIZATION = {
  govLineBn: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
  govLineEn: "Government of the People's Republic of Bangladesh",
  nameBn: "জাতীয় উন্নয়ন কর্তৃপক্ষ",
  nameEn: "National Development Authority",
  branchBn: "ঢাকা শাখা",
  branchEn: "Dhaka Branch",
} as const;

export const branch: TBranch = {
  id: BRANCH_ID,
  name: "National Development Authority — Dhaka Branch",
  address: "Bangladesh Secretariat Road, Ramna, Dhaka-1000, Bangladesh",
  phone: "+880 2-9512345",
  email: "info.dhaka@nda.gov.bd",
  logo: null,
  banner: null,
  createdAt: "2026-01-05T09:00:00.000Z",
  updatedAt: "2026-06-20T09:00:00.000Z",
};

/** Only published notices are ever served to the public site. */
export const notices: TNotice[] = [
  {
    id: 12,
    title: "অফিস আদেশ: জুলাই ২০২৬ মাসের সেবা প্রদানের সময়সূচি পুনর্নির্ধারণ",
    description:
      "সকল সেবাগ্রহীতার অবগতির জন্য জানানো যাচ্ছে যে, আগামী মাস হতে নাগরিক সেবা প্রদানের সময়সূচি সকাল ৯টা হতে বিকাল ৪টা পর্যন্ত পুনর্নির্ধারণ করা হলো।",
    fileUrl: "/assets/sample-notice.pdf",
    image: null,
    isPublished: true,
    branchId: BRANCH_ID,
    createdAt: "2026-06-28T04:00:00.000Z",
    updatedAt: "2026-06-28T04:00:00.000Z",
  },
  {
    id: 11,
    title: "নিয়োগ বিজ্ঞপ্তি: ঢাকা শাখায় বিভিন্ন পদে জনবল নিয়োগ সংক্রান্ত",
    description:
      "জাতীয় উন্নয়ন কর্তৃপক্ষের ঢাকা শাখায় রাজস্ব খাতভুক্ত বিভিন্ন স্থায়ী শূন্য পদে সরাসরি নিয়োগের লক্ষ্যে যোগ্য প্রার্থীদের নিকট হতে অনলাইনে আবেদন আহ্বান করা হচ্ছে।",
    fileUrl: "/assets/sample-notice.pdf",
    image: null,
    isPublished: true,
    branchId: BRANCH_ID,
    createdAt: "2026-06-22T06:30:00.000Z",
    updatedAt: "2026-06-22T06:30:00.000Z",
  },
  {
    id: 10,
    title: "দরপত্র বিজ্ঞপ্তি: অফিস সরঞ্জাম সরবরাহ ও স্থাপন (২০২৬-২৭)",
    description:
      "ঢাকা শাখার জন্য কম্পিউটার ও আনুষঙ্গিক অফিস সরঞ্জাম সরবরাহের নিমিত্ত উন্মুক্ত দরপত্র আহ্বান করা হচ্ছে। বিস্তারিত তথ্য সংযুক্ত দরপত্র দলিলে পাওয়া যাবে।",
    fileUrl: "/assets/sample-notice.pdf",
    image: null,
    isPublished: true,
    branchId: BRANCH_ID,
    createdAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
  },
  {
    id: 9,
    title: "গণবিজ্ঞপ্তি: সিটিজেন চার্টার অনুযায়ী সেবা প্রদান নিশ্চিতকরণ",
    description:
      "সেবার মান উন্নয়নের লক্ষ্যে সিটিজেন চার্টারে উল্লিখিত নির্ধারিত সময়সীমার মধ্যে সকল নাগরিক সেবা প্রদান নিশ্চিত করার জন্য সংশ্লিষ্ট সকলকে অনুরোধ করা হলো।",
    fileUrl: null,
    image: null,
    isPublished: true,
    branchId: BRANCH_ID,
    createdAt: "2026-06-05T08:00:00.000Z",
    updatedAt: "2026-06-05T08:00:00.000Z",
  },
  {
    id: 8,
    title: "বার্ষিক প্রতিবেদন ২০২৫-২৬ প্রকাশ সংক্রান্ত বিজ্ঞপ্তি",
    description:
      "ঢাকা শাখার ২০২৫-২৬ অর্থবছরের বার্ষিক কর্মসম্পাদন প্রতিবেদন প্রকাশ করা হয়েছে। আগ্রহীগণ ওয়েবসাইট হতে প্রতিবেদনটি ডাউনলোড করতে পারবেন।",
    fileUrl: "/assets/sample-notice.pdf",
    image: null,
    isPublished: true,
    branchId: BRANCH_ID,
    createdAt: "2026-05-29T07:15:00.000Z",
    updatedAt: "2026-05-29T07:15:00.000Z",
  },
];

/** Ordered by `order` ascending, matching the admin board-of-directors list. */
export const boardOfDirectors: TBoardOfDirector[] = [
  {
    id: 1,
    name: "ড. মোহাম্মদ রফিকুল ইসলাম",
    designation: "চেয়ারম্যান",
    avatar: "",
    order: 0,
    branchId: BRANCH_ID,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: 2,
    name: "বেগম নাসরিন সুলতানা",
    designation: "পরিচালক (প্রশাসন ও অর্থ)",
    avatar: "",
    order: 1,
    branchId: BRANCH_ID,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: 3,
    name: "জনাব আব্দুল কাদের চৌধুরী",
    designation: "পরিচালক (পরিকল্পনা ও উন্নয়ন)",
    avatar: "",
    order: 2,
    branchId: BRANCH_ID,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: 4,
    name: "জনাব তানভীর আহমেদ খান",
    designation: "শাখা ব্যবস্থাপক, ঢাকা",
    avatar: "",
    order: 3,
    branchId: BRANCH_ID,
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
];

/** Static "important links" block — standard across Bangladesh govt portals. */
export const importantLinks: { label: string; href: string }[] = [
  { label: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", href: "https://bangladesh.gov.bd" },
  { label: "মাইগভ (MyGov)", href: "https://mygov.bd" },
  { label: "ই-নথি", href: "https://www.nothi.gov.bd" },
  { label: "জাতীয় শুদ্ধাচার কৌশল", href: "#" },
  { label: "তথ্য অধিকার আইন", href: "#" },
  { label: "অভিযোগ প্রতিকার ব্যবস্থা (GRS)", href: "https://grs.gov.bd" },
  { label: "সিটিজেন চার্টার", href: "#" },
  { label: "ই-টেন্ডারিং", href: "https://www.eprocure.gov.bd" },
];
