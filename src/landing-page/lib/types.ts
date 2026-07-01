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
