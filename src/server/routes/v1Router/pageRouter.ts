import db from "@/server/db/client";
import { pagesTable } from "@/server/db/schemas";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/server/middleware/authMiddleware";
import { badRequest, forbidden, notFound, ok } from "@/server/responses";
import { replaceImage } from "@/server/service/cloudinary/imageUpload";
import type { TAppEnv } from "@/server/types";
import { canAccessBranch } from "@/server/utils/scope";
import { emptyToNull } from "@/server/utils/text";
import type { TTokenPayload } from "@/shared/types";
import { updatePageSchema } from "@/shared/validators/page.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const pageRouter = new Hono<TAppEnv>();

// A page's lifecycle is tied to its sub-menu (created and deleted with it), so
// this router only reads and updates pages — there is no create/delete here.

/**
 * GET /api/v1/page/by-submenu/:id — the page belonging to sub-menu `:id`.
 * Powers the dashboard page editor, which keys off the sub-menu.
 */
pageRouter.get(
  "/by-submenu/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.submenuId, id))
      .limit(1);

    if (!page) {
      return notFound(c, "Page not found");
    }
    if (admin && !canAccessBranch(admin, page.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Page fetched successfully", page);
  },
);

/** GET /api/v1/page/:id — public. */
pageRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, id))
      .limit(1);

    if (!page) {
      return notFound(c, "Page not found");
    }
    if (admin && !canAccessBranch(admin, page.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Page fetched successfully", page);
  },
);

/** PATCH /api/v1/page/:id — update banner, content, or publish state. */
pageRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", updatePageSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const {
      bannerImage,
      bannerTitleBn,
      bannerTitleEn,
      contentBn,
      contentEn,
      isPublished,
    } = c.req.valid("form");

    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, id))
      .limit(1);

    if (!page) {
      return notFound(c, "Page not found");
    }
    if (!canAccessBranch(admin, page.branchId)) {
      return forbidden(c);
    }

    // At least one banner-title language must remain set.
    const newBannerTitleBn =
      bannerTitleBn !== undefined
        ? emptyToNull(bannerTitleBn)
        : page.bannerTitleBn;
    const newBannerTitleEn =
      bannerTitleEn !== undefined
        ? emptyToNull(bannerTitleEn)
        : page.bannerTitleEn;
    if (!newBannerTitleBn && !newBannerTitleEn) {
      return badRequest(c, "Provide a banner title in Bangla or English");
    }

    const updates = {
      ...(bannerTitleBn !== undefined && { bannerTitleBn: newBannerTitleBn }),
      ...(bannerTitleEn !== undefined && { bannerTitleEn: newBannerTitleEn }),
      ...(contentBn !== undefined && { contentBn }),
      ...(contentEn !== undefined && { contentEn }),
      ...(isPublished !== undefined && { isPublished }),
      ...(bannerImage && {
        bannerImage: (await replaceImage(page.bannerImage ?? "", bannerImage))
          .url,
      }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(pagesTable).set(updates).where(eq(pagesTable.id, id));

    return ok(c, "Page updated successfully");
  },
);

export default pageRouter;
