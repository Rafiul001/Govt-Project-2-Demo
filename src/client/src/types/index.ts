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

export type TAdminType = "SUPER_ADMIN" | "BRANCH_ADMIN";
export type TSidebarPosition = "left" | "right";

// --- Entities ---

export type TBranch = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  logo: string | null;
  banner: string | null;
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

export type TLayout = {
  id: number;
  branchId: number;
  showLogo: boolean;
  showBanner: boolean;
  sidebarPosition: TSidebarPosition;
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
  address: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
};

export type TUpdateBranchInput = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
  banner?: File;
};

// --- Admin ---

export type TCreateAdminInput = {
  name: string;
  username: string;
  password: string;
  avatar?: File;
  adminType?: TAdminType;
  branchId?: number;
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
  name?: string;
  designation?: string;
  avatar?: File;
  order?: number;
};

// --- Layout ---

export type TCreateLayoutInput = {
  branchId?: number;
  showLogo?: boolean;
  showBanner?: boolean;
  sidebarPosition?: TSidebarPosition;
};

export type TUpdateLayoutInput = {
  showLogo?: boolean;
  showBanner?: boolean;
  sidebarPosition?: TSidebarPosition;
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
  title?: string;
  description?: string;
  file?: File;
  image?: File;
  isPublished?: boolean;
};
