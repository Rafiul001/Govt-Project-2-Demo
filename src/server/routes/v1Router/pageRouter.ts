import db from "@/server/db/client";
import { menusTable, pagesTable, submenusTable } from "@/server/db/schemas";
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
  importImageFromUrl,
  replaceImage,
  uploadImage,
} from "@/server/service/cloudinary/imageUpload";
import { deletePageImages } from "@/server/service/pageImageCleanup";
import type { TAppEnv } from "@/server/types";
import { canAccessBranch, resolveBranchId } from "@/server/utils/scope";
import { emptyToNull } from "@/server/utils/text";
import type { TTokenPayload } from "@/shared/types";
import {
  createPageSchema,
  importPageImageSchema,
  updatePageSchema,
  uploadPageImageSchema,
} from "@/shared/validators/page.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { Hono } from "hono";

const pageRouter = new Hono<TAppEnv>();

// A sub-menu page's lifecycle is tied to its sub-menu (created and deleted
// with it). A menu-attached page (a menu with no sub-menus linking straight to
// a page) is created and deleted here instead.

/**
 * POST /api/v1/page — create a page attached directly to a menu. Only valid
 * while the menu has no sub-menus (and no page yet); the banner title
 * defaults to the menu title so the editor always has something to show.
 */
pageRouter.post(
  "/",
  authMiddleware(),
  zValidator("json", createPageSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("json");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }

    const [menu] = await db
      .select({
        id: menusTable.id,
        branchId: menusTable.branchId,
        titleBn: menusTable.titleBn,
        titleEn: menusTable.titleEn,
      })
      .from(menusTable)
      .where(eq(menusTable.id, data.menuId))
      .limit(1);

    if (!menu) {
      return notFound(c, "Menu not found");
    }
    if (menu.branchId !== branchId) {
      return badRequest(c, "Menu does not belong to the target branch");
    }

    // A menu links either straight to one page or to sub-menus — never both.
    const [submenuCount] = await db
      .select({ value: count() })
      .from(submenusTable)
      .where(eq(submenusTable.menuId, menu.id));
    if ((submenuCount?.value ?? 0) > 0) {
      return badRequest(
        c,
        "This menu has sub-menus — add the page under one of them instead",
      );
    }

    const [existing] = await db
      .select({ id: pagesTable.id })
      .from(pagesTable)
      .where(eq(pagesTable.menuId, menu.id))
      .limit(1);
    if (existing) {
      return badRequest(c, "This menu already has a page");
    }

    await db.insert(pagesTable).values({
      bannerTitleBn: menu.titleBn,
      bannerTitleEn: menu.titleEn,
      menuId: menu.id,
      branchId,
    });

    return created(c, "Page created successfully");
  },
);

/**
 * GET /api/v1/page/by-menu/:id — the page attached directly to menu `:id`.
 * Powers the dashboard page editor for menus without sub-menus.
 */
pageRouter.get(
  "/by-menu/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.menuId, id))
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
      removeBannerImage,
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

    // The remove flag only applies when no replacement file was uploaded.
    if (!bannerImage && removeBannerImage) {
      await deleteImage(page.bannerImage ?? "");
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
      ...(!bannerImage && removeBannerImage && { bannerImage: null }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(pagesTable).set(updates).where(eq(pagesTable.id, id));

    return ok(c, "Page updated successfully");
  },
);

/**
 * POST /api/v1/page/:id/image — upload an image for use inside the page's
 * markdown content. Returns the Cloudinary URL the editor embeds; the asset is
 * deleted together with the page (see pageImageCleanup).
 */
pageRouter.post(
  "/:id/image",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("form", uploadPageImageSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { image } = c.req.valid("form");

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

    const uploaded = await uploadImage(image);
    return created(c, "Image uploaded successfully", { url: uploaded.url });
  },
);

/**
 * POST /api/v1/page/:id/image/import — import an image referenced by pasted
 * markdown (remote URL or data URI) into Cloudinary and return its new URL.
 * The editor swaps the pasted reference for the returned URL, so published
 * pages never depend on third-party image hosts.
 */
pageRouter.post(
  "/:id/image/import",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("json", importPageImageSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { url } = c.req.valid("json");

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

    try {
      const uploaded = await importImageFromUrl(url);
      return created(c, "Image imported successfully", { url: uploaded.url });
    } catch {
      // Cloudinary could not fetch the source (hotlink-blocked, dead link,
      // not an image, …) — a client problem with the pasted content, not ours.
      return badRequest(c, "Could not fetch the referenced image");
    }
  },
);

/**
 * DELETE /api/v1/page/:id — delete a menu-attached page, then its Cloudinary
 * images. Sub-menu pages live and die with their sub-menu, so they must be
 * removed by deleting the sub-menu instead.
 */
pageRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.id, id))
      .limit(1);

    if (!page) {
      return notFound(c, "Page not found");
    }
    if (!canAccessBranch(c.get("admin"), page.branchId)) {
      return forbidden(c);
    }
    if (page.menuId === null) {
      return badRequest(
        c,
        "This page belongs to a sub-menu — delete the sub-menu to remove it",
      );
    }

    await db.delete(pagesTable).where(eq(pagesTable.id, id));
    await deletePageImages([page]);

    return ok(c, "Page deleted successfully");
  },
);

export default pageRouter;
