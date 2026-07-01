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

export type TAdminType = "SUPER_ADMIN" | "BRANCH_ADMIN";

// --- Entities ---

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

export type TCreateBranchInput = {
  name: string;
  previewUrl: string;
  address: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
};

export type TUpdateBranchInput = {
  name?: string;
  previewUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
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
  branchId?: number;
};

/** Self-service profile update (any admin): password and/or avatar only. */
export type TUpdateProfileInput = {
  password?: string;
  avatar?: File;
};

// --- Board of directors ---

export type TCreateBoardOfDirectorInput = {
  branchId?: number;
  name: string;
  designation: string;
  avatar?: File;
  order?: number;
};

export type TUpdateBoardOfDirectorInput = {
  branchId?: number;
  name?: string;
  designation?: string;
  avatar?: File;
  order?: number;
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
  order?: number;
};
