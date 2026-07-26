/**
 * Bilingual (Bangla / English) string catalogue for the public site.
 *
 * The landing page chrome is fully static, so every visible label lives here
 * keyed by language. Components read the catalogue for the active language via
 * `useLanguage()` (see `components/providers/LanguageProvider.tsx`).
 *
 * Dynamic, API-sourced content (branch name, notice titles, member profiles) is
 * stored in a single language upstream and is rendered as-is — only the chrome
 * around it switches. Bilingual content (menus, pages, events, the branch's
 * "About us" copy) is picked per language via `pickLang`, and the `about`
 * entries below double as the fallback when a branch has written none.
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
    members: string;
    events: string;
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
  membersPage: {
    subtitle: string;
    backHome: string;
    count: string;
    empty: string;
    viewProfile: string;
  };
  memberPage: {
    backToCategory: string;
    heading: string;
    contact: string;
    personal: string;
    sports: string;
    mobile: string;
    email: string;
    dateOfBirth: string;
    bloodGroup: string;
    gender: string;
    nid: string;
    address: string;
    discipline: string;
    jerseyNumber: string;
    joiningDate: string;
    achievements: string;
    bio: string;
    empty: string;
  };
  events: {
    title: string;
    subtitle: string;
    empty: string;
    viewAll: string;
    venue: string;
    upcoming: string;
    past: string;
  };
  eventsPage: {
    heading: string;
    subtitle: string;
    backHome: string;
    empty: string;
    prevMonth: string;
    nextMonth: string;
    listHeading: string;
    allHeading: string;
    calendarHeading: string;
    searchPlaceholder: string;
    searchAction: string;
    clearFilters: string;
    filterAll: string;
    filterUpcoming: string;
    filterPast: string;
    fromDate: string;
    toDate: string;
    count: string;
    noResults: string;
    pageWord: string;
    prev: string;
    next: string;
    readMore: string;
  };
  eventPage: {
    backToEvents: string;
    starts: string;
    ends: string;
    venue: string;
    notFound: string;
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
      members: "সদস্যবৃন্দ",
      events: "ইভেন্ট",
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
    membersPage: {
      subtitle: "{branch} শাখার নিবন্ধিত সদস্যদের তালিকা।",
      backHome: "← প্রচ্ছদে ফিরুন",
      count: "জন সদস্য",
      empty: "এই শ্রেণিতে এখনো কোনো সদস্যের তথ্য প্রকাশ করা হয়নি।",
      viewProfile: "প্রোফাইল দেখুন",
    },
    memberPage: {
      backToCategory: "← তালিকায় ফিরুন",
      heading: "সদস্য প্রোফাইল",
      contact: "যোগাযোগের তথ্য",
      personal: "ব্যক্তিগত তথ্য",
      sports: "ক্রীড়া তথ্য",
      mobile: "মোবাইল",
      email: "ইমেইল",
      dateOfBirth: "জন্ম তারিখ",
      bloodGroup: "রক্তের গ্রুপ",
      gender: "লিঙ্গ",
      nid: "এনআইডি",
      address: "ঠিকানা",
      discipline: "ডিসিপ্লিন",
      jerseyNumber: "জার্সি নম্বর",
      joiningDate: "যোগদানের তারিখ",
      achievements: "অর্জন",
      bio: "সংক্ষিপ্ত পরিচিতি",
      empty: "এই সদস্যের বিস্তারিত তথ্য প্রকাশ করা হয়নি।",
    },
    events: {
      title: "ইভেন্ট",
      subtitle: "{branch} শাখার আসন্ন টুর্নামেন্ট, প্রশিক্ষণ ও কার্যক্রম।",
      empty: "এই মুহূর্তে কোনো ইভেন্ট নেই।",
      viewAll: "সকল ইভেন্ট দেখুন →",
      venue: "স্থান",
      upcoming: "আসন্ন ইভেন্ট",
      past: "সমাপ্ত ইভেন্ট",
    },
    eventsPage: {
      heading: "ইভেন্ট",
      subtitle: "{branch} শাখার টুর্নামেন্ট, প্রশিক্ষণ ও কার্যক্রমের সময়সূচি।",
      backHome: "← প্রচ্ছদে ফিরুন",
      empty: "এই মুহূর্তে কোনো ইভেন্ট নেই।",
      prevMonth: "পূর্ববর্তী মাস",
      nextMonth: "পরবর্তী মাস",
      listHeading: "এই মাসের ইভেন্ট",
      allHeading: "সকল ইভেন্ট",
      calendarHeading: "ইভেন্ট ক্যালেন্ডার",
      searchPlaceholder: "শিরোনাম বা স্থান দিয়ে খুঁজুন…",
      searchAction: "খুঁজুন",
      clearFilters: "ফিল্টার মুছুন",
      filterAll: "সকল",
      filterUpcoming: "আসন্ন",
      filterPast: "সমাপ্ত",
      fromDate: "শুরুর তারিখ",
      toDate: "শেষের তারিখ",
      count: "টি ইভেন্ট",
      noResults: "অনুসন্ধানে কোনো ইভেন্ট পাওয়া যায়নি।",
      pageWord: "পৃষ্ঠা",
      prev: "পূর্ববর্তী",
      next: "পরবর্তী",
      readMore: "বিস্তারিত দেখুন →",
    },
    eventPage: {
      backToEvents: "← সকল ইভেন্টে ফিরুন",
      starts: "শুরু",
      ends: "শেষ",
      venue: "স্থান",
      notFound: "ইভেন্টটি পাওয়া যায়নি।",
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
      members: "Members",
      events: "Events",
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
    membersPage: {
      subtitle: "Registered members of the {branch} Branch.",
      backHome: "← Back to Home",
      count: "members",
      empty: "No member information has been published in this category yet.",
      viewProfile: "View profile",
    },
    memberPage: {
      backToCategory: "← Back to the list",
      heading: "Member Profile",
      contact: "Contact Information",
      personal: "Personal Information",
      sports: "Sports Information",
      mobile: "Mobile",
      email: "Email",
      dateOfBirth: "Date of birth",
      bloodGroup: "Blood group",
      gender: "Gender",
      nid: "NID",
      address: "Address",
      discipline: "Discipline",
      jerseyNumber: "Jersey number",
      joiningDate: "Joining date",
      achievements: "Achievements",
      bio: "Biography",
      empty: "No further details have been published for this member.",
    },
    events: {
      title: "Events",
      subtitle:
        "Upcoming tournaments, training and programmes of the {branch} Branch.",
      empty: "There are no events at this time.",
      viewAll: "View all events →",
      venue: "Venue",
      upcoming: "Upcoming Events",
      past: "Past Events",
    },
    eventsPage: {
      heading: "Events",
      subtitle:
        "Schedule of tournaments, training and programmes of the {branch} Branch.",
      backHome: "← Back to Home",
      empty: "There are no events at this time.",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      listHeading: "Events this month",
      allHeading: "All Events",
      calendarHeading: "Event Calendar",
      searchPlaceholder: "Search by title or venue…",
      searchAction: "Search",
      clearFilters: "Clear filters",
      filterAll: "All",
      filterUpcoming: "Upcoming",
      filterPast: "Past",
      fromDate: "From",
      toDate: "To",
      count: "events",
      noResults: "No events matched your filters.",
      pageWord: "Page",
      prev: "Previous",
      next: "Next",
      readMore: "View details →",
    },
    eventPage: {
      backToEvents: "← Back to all events",
      starts: "Starts",
      ends: "Ends",
      venue: "Venue",
      notFound: "Event not found.",
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
  },
};
