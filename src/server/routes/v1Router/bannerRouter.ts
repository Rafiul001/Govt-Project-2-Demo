import db from "@/server/db/client";
import { bannersTable } from "@/server/db/schemas";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/server/middleware/authMiddleware";
import {
  badRequest,
  created,
  forbidden,
  notFound,
  ok,
} from "@/server/responses";
import {
  deleteImage,
  replaceImage,
  uploadImage,
} from "@/server/service/cloudinary/imageUpload";
import type { TAppEnv } from "@/server/types";
import { pageOffset, paginated } from "@/server/utils/pagination";
import {
  branchExists,
  branchIdByName,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
  resolveBranchUpdate,
} from "@/server/utils/scope";
import type { TTokenPayload } from "@/shared/types";
import {
  createBannerSchema,
  updateBannerSchema,
} from "@/shared/validators/banner.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { Hono } from "hono";

const bannerRouter = new Hono<TAppEnv>();

// Reads are public; mutations require an authenticated admin (per-route below).

/**
 * GET /api/v1/banner — list banners (paginated).
 *
 * - Branch admin (dashboard): pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 *
 * An unknown branch name yields an empty page.
 */
bannerRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", branchListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, branchName, search } = c.req.valid("query");

    let branchId: number | null | undefined;
    if (admin && !isSuperAdmin(admin)) {
      branchId = admin.branchId!;
    } else if (branchName) {
      branchId = await branchIdByName(branchName);
      if (branchId === null) {
        return ok(
          c,
          "Banners fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    const where = and(
      branchId != null ? eq(bannersTable.branchId, branchId) : undefined,
      search
        ? or(
            ilike(bannersTable.title, `%${search}%`),
            ilike(bannersTable.subTitle, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(bannersTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(bannersTable)
      .where(where)
      .orderBy(bannersTable.order, bannersTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Banners fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/banner/:id — public. */
bannerRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [banner] = await db
      .select()
      .from(bannersTable)
      .where(eq(bannersTable.id, id))
      .limit(1);

    if (!banner) {
      return notFound(c, "Banner not found");
    }
    if (admin && !canAccessBranch(admin, banner.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Banner fetched successfully", banner);
  },
);

/** POST /api/v1/banner */
bannerRouter.post(
  "/",
  authMiddleware(),
  zValidator("form", createBannerSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("form");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const image = data.image ? (await uploadImage(data.image)).url : null;

    await db.insert(bannersTable).values({
      title: data.title,
      subTitle: data.subTitle,
      image,
      order: data.order,
      branchId,
    });

    return created(c, "Banner created successfully");
  },
);

/** PATCH /api/v1/banner/:id */
bannerRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updateBannerSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { image, removeImage, branchId, ...rest } = c.req.valid("form");

    const [banner] = await db
      .select()
      .from(bannersTable)
      .where(eq(bannersTable.id, id))
      .limit(1);

    if (!banner) {
      return notFound(c, "Banner not found");
    }
    if (!canAccessBranch(admin, banner.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the banner to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }

    // The remove flag only applies when no replacement file was uploaded.
    if (!image && removeImage) {
      await deleteImage(banner.image ?? "");
    }

    const updates = {
      ...rest,
      ...(newBranchId !== undefined && { branchId: newBranchId }),
      ...(image && {
        image: (await replaceImage(banner.image ?? "", image)).url,
      }),
      ...(!image && removeImage && { image: null }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id));

    return ok(c, "Banner updated successfully");
  },
);

/** DELETE /api/v1/banner/:id */
bannerRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [banner] = await db
      .select()
      .from(bannersTable)
      .where(eq(bannersTable.id, id))
      .limit(1);

    if (!banner) {
      return notFound(c, "Banner not found");
    }
    if (!canAccessBranch(c.get("admin"), banner.branchId)) {
      return forbidden(c);
    }

    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    await deleteImage(banner.image ?? "");
    return ok(c, "Banner deleted successfully");
  },
);

export default bannerRouter;
