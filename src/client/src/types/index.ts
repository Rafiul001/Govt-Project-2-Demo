/**
 * Client-side mirrors of the backend API shapes. Dates are serialized to
 * strings over JSON, so timestamp fields are typed as `string`.
 */

/** Standard success envelope returned by the API. */
export type TApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** Paginated list payload returned by list endpoints (inside `data`). */
export type TPaginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Page/size params accepted by list hooks. */
export type TPageParams = {
  page: number;
  pageSize: number;
};

/** List params: pagination plus optional free-text search + branch filter. */
export type TListParams = TPageParams & {
  search?: string;
  branchName?: string;
};

/** List params for sub-menus: list params plus an optional `menuId` filter. */
export type TSubmenuListParams = TListParams & {
  menuId?: number;
};

/** List params for members: list params plus an optional category filter. */
export type TMemberListParams = TListParams & {
  categoryId?: number;
};

/** List params for events: list params plus an optional date window. */
export type TEventListParams = TListParams & {
  /** Inclusive `YYYY-MM-DD` window; events are matched by overlap. */
  from?: string;
  to?: string;
};

export type TAdminType = "SUPER_ADMIN" | "BRANCH_ADMIN";

// --- Entities ---

/** One card of the branch's public "About us" highlight row. */
export type TAboutHighlight = {
  /** Icon key; see `aboutHighlightIconValues` in the validators. */
  icon?: string;
  titleBn?: string;
  titleEn?: string;
  bodyBn?: string;
  bodyEn?: string;
};

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
  /** Public "About us" copy; `null` falls back to the landing page defaults. */
  aboutTitleBn: string | null;
  aboutTitleEn: string | null;
  aboutSubtitleBn: string | null;
  aboutSubtitleEn: string | null;
  aboutIntroBn: string | null;
  aboutIntroEn: string | null;
  aboutHighlights: TAboutHighlight[] | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * The "About us" fields as they go over the wire: multipart carries strings
 * only, so the highlight cards are sent JSON-encoded.
 */
export type TBranchAboutInput = {
  aboutTitleBn?: string;
  aboutTitleEn?: string;
  aboutSubtitleBn?: string;
  aboutSubtitleEn?: string;
  aboutIntroBn?: string;
  aboutIntroEn?: string;
  /** JSON-encoded `TAboutHighlight[]`. */
  aboutHighlights?: string;
};

/** Admin as returned by the API (password stripped). */
export type TAdmin = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  adminType: TAdminType;
  branchId: number | null;
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

// --- Auth ---

export type TLoginInput = {
  username: string;
  password: string;
};

export type TLoginResult = {
  accessToken: string;
  refreshToken: string;
};

// --- Branch ---

export type TCreateBranchInput = TBranchAboutInput & {
  name: string;
  previewUrl: string;
  address: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
};

export type TUpdateBranchInput = TBranchAboutInput & {
  name?: string;
  previewUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
  /** Remove the saved logo (ignored when a new `logo` file is sent). */
  removeLogo?: boolean;
  /** Remove the saved banner (ignored when a new `banner` file is sent). */
  removeBanner?: boolean;
  isPublished?: boolean;
};

// --- Admin ---

export type TCreateAdminInput = {
  name: string;
  username: string;
  password: string;
  avatar?: File;
  branchId: number;
};

export type TUpdateAdminInput = {
  name?: string;
  username?: string;
  password?: string;
  avatar?: File;
  /** Remove the saved avatar (ignored when a new `avatar` file is sent). */
  removeAvatar?: boolean;
  branchId?: number;
};

/** Self-service profile update (any admin): password and/or avatar only. */
export type TUpdateProfileInput = {
  password?: string;
  avatar?: File;
  /** Remove the saved avatar (ignored when a new `avatar` file is sent). */
  removeAvatar?: boolean;
};

// --- Notice ---

export type TCreateNoticeInput = {
  branchId?: number;
  title: string;
  description?: string;
  file?: File;
  image?: File;
  isPublished?: boolean;
};

export type TUpdateNoticeInput = {
  branchId?: number;
  title?: string;
  description?: string;
  file?: File;
  image?: File;
  /** Remove the saved PDF (ignored when a new `file` is sent). */
  removeFile?: boolean;
  /** Remove the saved image (ignored when a new `image` file is sent). */
  removeImage?: boolean;
  isPublished?: boolean;
};

// --- Banner ---

export type TCreateBannerInput = {
  branchId?: number;
  title: string;
  subTitle: string;
  image?: File;
  order?: number;
};

export type TUpdateBannerInput = {
  branchId?: number;
  title?: string;
  subTitle?: string;
  image?: File;
  /** Remove the saved image (ignored when a new `image` file is sent). */
  removeImage?: boolean;
  order?: number;
};

// --- Menu / Sub-menu / Page (dynamic navigation) ---

export type TMenu = {
  id: number;
  titleBn: string | null;
  titleEn: string | null;
  slug: string;
  order: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

export type TSubmenu = {
  id: number;
  titleBn: string | null;
  titleEn: string | null;
  slug: string;
  order: number;
  menuId: number;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

export type TPage = {
  id: number;
  bannerTitleBn: string | null;
  bannerTitleEn: string | null;
  bannerImage: string | null;
  contentBn: string | null;
  contentEn: string | null;
  isPublished: boolean;
  /** Exactly one of `submenuId`/`menuId` is set (menu-attached pages have no sub-menu). */
  submenuId: number | null;
  menuId: number | null;
  branchId: number;
  createdAt: string;
  updatedAt: string;
};

export type TCreatePageInput = {
  menuId: number;
  branchId?: number;
};

export type TCreateMenuInput = {
  branchId?: number;
  titleBn?: string;
  titleEn?: string;
  order?: number;
};

export type TUpdateMenuInput = {
  branchId?: number;
  titleBn?: string;
  titleEn?: string;
  order?: number;
};

export type TCreateSubmenuInput = {
  branchId?: number;
  menuId: number;
  titleBn?: string;
  titleEn?: string;
  order?: number;
};

export type TUpdateSubmenuInput = {
  branchId?: number;
  menuId?: number;
  titleBn?: string;
  titleEn?: string;
  order?: number;
};

export type TUpdatePageInput = {
  bannerTitleBn?: string;
  bannerTitleEn?: string;
  bannerImage?: File;
  /** Remove the saved banner image (ignored when a new file is sent). */
  removeBannerImage?: boolean;
  contentBn?: string;
  contentEn?: string;
  isPublished?: boolean;
};

// --- Member category (dynamic, global, super-admin managed) ---

export type TMemberCategory = {
  id: number;
  nameBn: string | null;
  nameEn: string | null;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type TCreateMemberCategoryInput = {
  nameBn?: string;
  nameEn?: string;
  slug: string;
  order?: number;
};

export type TUpdateMemberCategoryInput = {
  nameBn?: string;
  nameEn?: string;
  slug?: string;
  order?: number;
};

// --- Member (GEMS-style profile) ---

export type TMember = {
  id: number;
  nameBn: string | null;
  nameEn: string | null;
  designation: string | null;
  photo: string | null;
  mobile: string | null;
  email: string | null;
  order: number;
  /**
   * Profile fields this member publishes on the landing site. `null` means
   * never configured — the API then applies its default set.
   */
  publicFields: string[] | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  gender: string | null;
  nid: string | null;
  address: string | null;
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

export type TCreateMemberInput = {
  branchId?: number;
  categoryId: number;
  nameBn?: string;
  nameEn?: string;
  designation?: string;
  photo?: File;
  mobile?: string;
  email?: string;
  order?: number;
  /** JSON-encoded array of published field names. */
  publicFields?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  gender?: string;
  nid?: string;
  address?: string;
  discipline?: string;
  jerseyNumber?: number;
  joiningDate?: string;
  achievements?: string;
  bio?: string;
};

export type TUpdateMemberInput = Omit<TCreateMemberInput, "categoryId"> & {
  categoryId?: number;
  /** Remove the saved photo (ignored when a new `photo` file is sent). */
  removePhoto?: boolean;
};

// --- Event ---

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

export type TCreateEventInput = {
  branchId?: number;
  titleBn?: string;
  titleEn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  venue?: string;
  /** `datetime-local` value (`YYYY-MM-DDTHH:mm`); the API coerces it. */
  startAt: string;
  endAt?: string;
  image?: File;
  isPublished?: boolean;
};

export type TUpdateEventInput = Omit<TCreateEventInput, "startAt"> & {
  startAt?: string;
  /** Remove the saved image (ignored when a new `image` file is sent). */
  removeImage?: boolean;
};
