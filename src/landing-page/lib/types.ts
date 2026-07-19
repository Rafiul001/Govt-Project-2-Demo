/**
 * Public-facing mirrors of the backend API entity shapes
 * (see `src/server/db/schemas` and `src/client/src/types`).
 *
 * The landing page only ever renders *public* data: the branch profile,
 * its published notices, and its board of directors. These types match the
 * JSON the API returns (dates serialized as strings) so the static data in
 * `lib/data.ts` can later be swapped for a real public endpoint with no
 * changes to the components.
 */

export type TBranch = {
  id: number;
  name: string;
  previewUrl: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  logo: string | null;
  banner: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TNotice = {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  image: string | null;
  isPublished: boolean;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

export type TBoardOfDirector = {
  id: number;
  name: string;
  designation: string;
  avatar: string;
  order: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

export type TBanner = {
  id: number;
  title: string;
  subTitle: string;
  image: string | null;
  order: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

// --- Members (dynamic categories of people) ---

/** A dynamic member category (players, coaches, …), shared by every branch. */
export type TMemberCategory = {
  id: number;
  nameBn: string | null;
  nameEn: string | null;
  /** URL key of the category's page: `/members/:slug`. */
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * A member profile as the PUBLIC API returns it — the private fields (NID,
 * mobile, email, address, date of birth) are stripped server-side for
 * anonymous callers and never reach this site.
 */
export type TMember = {
  id: number;
  nameBn: string | null;
  nameEn: string | null;
  designation: string | null;
  photo: string | null;
  order: number;
  bloodGroup: string | null;
  gender: string | null;
  discipline: string | null;
  jerseyNumber: number | null;
  joiningDate: string | null;
  achievements: string | null;
  bio: string | null;
  categoryId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

// --- Events ---

export type TEvent = {
  id: number;
  titleBn: string | null;
  titleEn: string | null;
  descriptionBn: string | null;
  descriptionEn: string | null;
  venue: string | null;
  startAt: string;
  endAt: string | null;
  image: string | null;
  isPublished: boolean;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

// --- Dynamic menus / pages ---

// All titles/content are bilingual (`*Bn`/`*En`): each language is optional but
// at least one is always set. The site renders the active language and falls
// back to the other when it is empty — see `pickLang` in `lib/i18n.ts`.

/** A sub-menu node in the public navigation tree (`GET /api/v1/nav`). */
export type TNavSubmenu = {
  id: number;
  menuId: number;
  titleBn: string | null;
  titleEn: string | null;
  slug: string;
  order: number;
};

/** A menu node in the public navigation tree, with its published sub-menus. */
export type TNavMenu = {
  id: number;
  titleBn: string | null;
  titleEn: string | null;
  slug: string;
  order: number;
  /** The menu's page is attached directly (`/:menuSlug`) — no dropdown. */
  hasPage: boolean;
  submenus: TNavSubmenu[];
};

/** A published page resolved by slug (`GET /api/v1/nav/page`). */
export type TDynamicPage = {
  pageId: number;
  bannerTitleBn: string | null;
  bannerTitleEn: string | null;
  bannerImage: string | null;
  contentBn: string | null;
  contentEn: string | null;
  isPublished: boolean;
  menuTitleBn: string | null;
  menuTitleEn: string | null;
  menuSlug: string;
  submenuTitleBn: string | null;
  submenuTitleEn: string | null;
  /** `null` when the page is attached directly to the menu (`/:menuSlug`). */
  submenuSlug: string | null;
};

/**
 * Payload posted by the dashboard page editor into the `/preview/page` iframe.
 * The banner image may be a data URL (a freshly picked file) so it survives the
 * cross-origin `postMessage`.
 */
export type TPagePreview = {
  branch: TBranch;
  menuTitleBn: string | null;
  menuTitleEn: string | null;
  submenuTitleBn: string | null;
  submenuTitleEn: string | null;
  page: {
    bannerTitleBn: string | null;
    bannerTitleEn: string | null;
    bannerImage: string | null;
    contentBn: string | null;
    contentEn: string | null;
  };
};
