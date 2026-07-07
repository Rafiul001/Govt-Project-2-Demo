/**
 * Bilingual (Bangla / English) string catalogue for the public site.
 *
 * The landing page chrome is fully static, so every visible label lives here
 * keyed by language. Components read the catalogue for the active language via
 * `useLanguage()` (see `components/providers/LanguageProvider.tsx`).
 *
 * Dynamic, API-sourced content (branch name, notice titles, board members) is
 * stored in a single language upstream and is rendered as-is — only the chrome
 * around it switches.
 */

export type TLanguage = "bn" | "en";

export const LANGUAGES: { code: TLanguage; label: string }[] = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
];

export const DEFAULT_LANGUAGE: TLanguage = "bn";

/**
 * Fills the `{branch}` placeholder in a catalogue string with the current
 * branch's name (stored in one language upstream, rendered as-is). Strings
 * without the placeholder pass through unchanged.
 */
export function withBranch(
  text: string,
  branchName: string | null | undefined,
): string {
  return text.replaceAll("{branch}", branchName ?? "");
}

/**
 * Picks a bilingual value for the active language, falling back to the other
 * language when the preferred one is empty. Used for API-sourced content
 * (menus, sub-menus, pages) stored per language. Returns "" when neither is set.
 */
export function pickLang(
  lang: TLanguage,
  bn: string | null | undefined,
  en: string | null | undefined,
): string {
  const preferred = lang === "bn" ? bn : en;
  const fallback = lang === "bn" ? en : bn;
  return (preferred?.trim() ? preferred : fallback) ?? "";
}

type TDictionary = {
  topBar: {
    nationalPortal: string;
    selectLanguage: string;
  };
  org: {
    govLine: string;
    name: string;
  };
  header: {
    emblemAlt: string;
    flagAlt: string;
    branchSuffix: string;
  };
  nav: {
    menu: string;
    openMenu: string;
    home: string;
    about: string;
    notices: string;
    board: string;
    contact: string;
  };
  hero: {
    badge: string;
    slides: { title: string; subtitle: string }[];
    viewNotices: string;
    contactUs: string;
    previous: string;
    next: string;
    slide: string;
  };
  about: {
    title: string;
    subtitle: string;
    intro: string;
    highlights: { title: string; body: string }[];
  };
  notices: {
    title: string;
    empty: string;
    viewAll: string;
    importantLinks: string;
    publishedOn: string;
    download: string;
  };
  noticesPage: {
    heading: string;
    subtitle: string;
    backHome: string;
    count: string;
    empty: string;
    searchPlaceholder: string;
    searchAction: string;
    noResults: string;
    pageWord: string;
    prev: string;
    next: string;
  };
  board: {
    title: string;
    subtitle: string;
    empty: string;
    viewAll: string;
  };
  boardPage: {
    heading: string;
    subtitle: string;
    backHome: string;
    count: string;
    empty: string;
  };
  contact: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    officeHours: string;
    officeHoursValue: string;
    mapTitle: string;
  };
  footer: {
    tagline: string;
    contact: string;
    importantLinks: string;
    quickAccess: string;
    rightsReserved: string;
  };
  directory: {
    title: string;
    subtitle: string;
    visit: string;
    empty: string;
  };
};

export const dictionaries: Record<TLanguage, TDictionary> = {
  bn: {
    topBar: {
      nationalPortal: "জাতীয় তথ্য বাতায়ন",
      selectLanguage: "ভাষা নির্বাচন",
    },
    org: {
      govLine: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
      name: "জাতীয় উন্নয়ন কর্তৃপক্ষ",
    },
    header: {
      emblemAlt: "বাংলাদেশ সরকারের জাতীয় প্রতীক",
      flagAlt: "বাংলাদেশের জাতীয় পতাকা",
      branchSuffix: "শাখা",
    },
    nav: {
      menu: "মেনু",
      openMenu: "মেনু খুলুন",
      home: "প্রচ্ছদ",
      about: "আমাদের সম্পর্কে",
      notices: "নোটিশ বোর্ড",
      board: "পরিচালনা পর্ষদ",
      contact: "যোগাযোগ",
    },
    hero: {
      badge: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার",
      slides: [
        {
          title: "{branch} শাখায় আপনাকে স্বাগতম",
          subtitle:
            "স্বচ্ছতা, জবাবদিহিতা ও জনগণের দোরগোড়ায় সেবা পৌঁছে দেওয়াই আমাদের অঙ্গীকার।",
        },
        {
          title: "ডিজিটাল বাংলাদেশ, স্মার্ট সেবা",
          subtitle:
            "অনলাইনে আবেদন, নোটিশ ও তথ্যসেবা — দ্রুত, সহজ ও নির্ভরযোগ্য নাগরিক সেবা।",
        },
        {
          title: "নাগরিক সেবাই আমাদের প্রথম অগ্রাধিকার",
          subtitle:
            "সিটিজেন চার্টার অনুযায়ী নির্ধারিত সময়ে মানসম্মত সেবা প্রদান নিশ্চিত করা হয়।",
        },
      ],
      viewNotices: "নোটিশ বোর্ড দেখুন",
      contactUs: "যোগাযোগ করুন",
      previous: "পূর্ববর্তী",
      next: "পরবর্তী",
      slide: "স্লাইড",
    },
    about: {
      title: "আমাদের সম্পর্কে",
      subtitle:
        "জাতীয় উন্নয়ন কর্তৃপক্ষ জনগণের কল্যাণে নিবেদিত একটি সরকারি প্রতিষ্ঠান।",
      intro:
        "জাতীয় উন্নয়ন কর্তৃপক্ষ-এর {branch} শাখা নাগরিক সেবা সহজীকরণ, উন্নয়ন কার্যক্রম বাস্তবায়ন এবং সরকারি নীতিমালা বাস্তবায়নে গুরুত্বপূর্ণ ভূমিকা পালন করে আসছে। আমরা স্বচ্ছতা ও জবাবদিহিতার সাথে জনগণকে মানসম্মত সেবা প্রদানে অঙ্গীকারবদ্ধ।",
      highlights: [
        {
          title: "স্বচ্ছ ও জবাবদিহিমূলক সেবা",
          body: "সিটিজেন চার্টার অনুযায়ী নির্ধারিত সময়ে স্বচ্ছতার সাথে নাগরিক সেবা প্রদান করা হয়।",
        },
        {
          title: "জনবান্ধব কার্যক্রম",
          body: "জনগণের দোরগোড়ায় সেবা পৌঁছে দিতে শাখা পর্যায়ে নিয়মিত কার্যক্রম পরিচালিত হয়।",
        },
        {
          title: "আধুনিক প্রশাসন",
          body: "ই-নথি ও ডিজিটাল সেবার মাধ্যমে দ্রুত ও কার্যকর প্রশাসনিক কার্যক্রম নিশ্চিত করা হয়।",
        },
      ],
    },
    notices: {
      title: "নোটিশ বোর্ড",
      empty: "এই মুহূর্তে প্রকাশিত কোনো নোটিশ নেই।",
      viewAll: "সকল নোটিশ দেখুন →",
      importantLinks: "গুরুত্বপূর্ণ লিংক",
      publishedOn: "প্রকাশকাল",
      download: "ডাউনলোড",
    },
    noticesPage: {
      heading: "সকল নোটিশ",
      subtitle: "{branch} শাখার প্রকাশিত সকল নোটিশ ও বিজ্ঞপ্তি।",
      backHome: "← প্রচ্ছদে ফিরুন",
      count: "টি নোটিশ",
      empty: "এই মুহূর্তে প্রকাশিত কোনো নোটিশ নেই।",
      searchPlaceholder: "শিরোনাম বা বিবরণ দিয়ে খুঁজুন…",
      searchAction: "খুঁজুন",
      noResults: "অনুসন্ধানে কোনো নোটিশ পাওয়া যায়নি।",
      pageWord: "পৃষ্ঠা",
      prev: "পূর্ববর্তী",
      next: "পরবর্তী",
    },
    board: {
      title: "পরিচালনা পর্ষদ",
      subtitle:
        "প্রতিষ্ঠানের নীতিনির্ধারণ ও পরিচালনায় নিয়োজিত সম্মানিত কর্মকর্তাবৃন্দ।",
      empty: "পরিচালনা পর্ষদের তথ্য শীঘ্রই প্রকাশ করা হবে।",
      viewAll: "সকল সদস্য দেখুন →",
    },
    boardPage: {
      heading: "পরিচালনা পর্ষদ",
      subtitle:
        "{branch} শাখার নীতিনির্ধারণ ও পরিচালনায় নিয়োজিত সম্মানিত কর্মকর্তাবৃন্দ।",
      backHome: "← প্রচ্ছদে ফিরুন",
      count: "জন সদস্য",
      empty: "পরিচালনা পর্ষদের তথ্য শীঘ্রই প্রকাশ করা হবে।",
    },
    contact: {
      title: "যোগাযোগ",
      subtitle: "যেকোনো প্রয়োজনে নিচের ঠিকানায় আমাদের সাথে যোগাযোগ করুন।",
      address: "ঠিকানা",
      phone: "ফোন",
      email: "ইমেইল",
      officeHours: "অফিস সময়",
      officeHoursValue:
        "রবি – বৃহস্পতি, সকাল ৯টা – বিকাল ৪টা (সরকারি ছুটি ব্যতীত)",
      mapTitle: "অবস্থান মানচিত্র",
    },
    footer: {
      tagline:
        "জনগণের কল্যাণে স্বচ্ছ, জবাবদিহিমূলক ও মানসম্মত সেবা প্রদানে আমরা অঙ্গীকারবদ্ধ।",
      contact: "যোগাযোগ",
      importantLinks: "গুরুত্বপূর্ণ লিংক",
      quickAccess: "দ্রুত প্রবেশ",
      rightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
    },
    directory: {
      title: "শাখা নির্বাচন করুন",
      subtitle:
        "জাতীয় উন্নয়ন কর্তৃপক্ষ-এর শাখাসমূহ — আপনার কাঙ্ক্ষিত শাখার ওয়েবসাইটে প্রবেশ করুন।",
      visit: "ওয়েবসাইটে যান →",
      empty: "এই মুহূর্তে কোনো শাখা প্রকাশিত নেই।",
    },
  },
  en: {
    topBar: {
      nationalPortal: "National Web Portal",
      selectLanguage: "Select language",
    },
    org: {
      govLine: "Government of the People's Republic of Bangladesh",
      name: "National Development Authority",
    },
    header: {
      emblemAlt: "National emblem of the Government of Bangladesh",
      flagAlt: "National flag of Bangladesh",
      branchSuffix: "Branch",
    },
    nav: {
      menu: "Menu",
      openMenu: "Open menu",
      home: "Home",
      about: "About Us",
      notices: "Notice Board",
      board: "Board of Directors",
      contact: "Contact",
    },
    hero: {
      badge: "Government of the People's Republic of Bangladesh",
      slides: [
        {
          title: "Welcome to the {branch} Branch",
          subtitle:
            "Transparency, accountability, and delivering services to people's doorsteps are our commitment.",
        },
        {
          title: "Digital Bangladesh, Smart Services",
          subtitle:
            "Online applications, notices, and information services — fast, simple, and reliable citizen services.",
        },
        {
          title: "Citizen Service Is Our First Priority",
          subtitle:
            "Quality services are delivered within set timeframes in line with the Citizen's Charter.",
        },
      ],
      viewNotices: "View Notice Board",
      contactUs: "Contact Us",
      previous: "Previous",
      next: "Next",
      slide: "Slide",
    },
    about: {
      title: "About Us",
      subtitle:
        "The National Development Authority is a government institution dedicated to public welfare.",
      intro:
        "The {branch} Branch of the National Development Authority has long played a vital role in simplifying citizen services, implementing development programmes, and carrying out government policies. We are committed to providing quality service to the public with transparency and accountability.",
      highlights: [
        {
          title: "Transparent & Accountable Service",
          body: "Citizen services are provided transparently within the timeframes set by the Citizen's Charter.",
        },
        {
          title: "People-Friendly Activities",
          body: "Regular activities are carried out at the branch level to bring services to people's doorsteps.",
        },
        {
          title: "Modern Administration",
          body: "Fast and effective administrative operations are ensured through e-Nothi and digital services.",
        },
      ],
    },
    notices: {
      title: "Notice Board",
      empty: "There are no published notices at this time.",
      viewAll: "View all notices →",
      importantLinks: "Important Links",
      publishedOn: "Published",
      download: "Download",
    },
    noticesPage: {
      heading: "All Notices",
      subtitle:
        "All published notices and announcements of the {branch} Branch.",
      backHome: "← Back to Home",
      count: "notices",
      empty: "There are no published notices at this time.",
      searchPlaceholder: "Search by title or description…",
      searchAction: "Search",
      noResults: "No notices matched your search.",
      pageWord: "Page",
      prev: "Previous",
      next: "Next",
    },
    board: {
      title: "Board of Directors",
      subtitle:
        "The honourable officials entrusted with the policy-making and management of the institution.",
      empty: "Information on the board of directors will be published soon.",
      viewAll: "View all members →",
    },
    boardPage: {
      heading: "Board of Directors",
      subtitle:
        "The honourable officials entrusted with the policy-making and management of the {branch} Branch.",
      backHome: "← Back to Home",
      count: "members",
      empty: "Information on the board of directors will be published soon.",
    },
    contact: {
      title: "Contact",
      subtitle: "For any need, reach out to us at the address below.",
      address: "Address",
      phone: "Phone",
      email: "Email",
      officeHours: "Office Hours",
      officeHoursValue:
        "Sun – Thu, 9:00 AM – 4:00 PM (except government holidays)",
      mapTitle: "Location map",
    },
    footer: {
      tagline:
        "We are committed to providing transparent, accountable, and quality service for the welfare of the people.",
      contact: "Contact",
      importantLinks: "Important Links",
      quickAccess: "Quick Access",
      rightsReserved: "All rights reserved.",
    },
    directory: {
      title: "Select a Branch",
      subtitle:
        "Branches of the National Development Authority — visit the website of your desired branch.",
      visit: "Visit website →",
      empty: "No branches are published at this time.",
    },
  },
};
