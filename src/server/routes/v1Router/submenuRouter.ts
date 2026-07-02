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
import { deletePageImages } from "@/server/service/pageImageCleanup";
import type { TAppEnv } from "@/server/types";
import { pageOffset, paginated } from "@/server/utils/pagination";
import {
  branchIdByName,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
} from "@/server/utils/scope";
import { uniqueSlug } from "@/server/utils/slug";
import { emptyToNull, slugSource } from "@/server/utils/text";
import type { TTokenPayload } from "@/shared/types";
import { submenuListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import {
  createSubmenuSchema,
  updateSubmenuSchema,
} from "@/shared/validators/submenu.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { Hono } from "hono";

const submenuRouter = new Hono<TAppEnv>();

/** Whether `slug` is already used by another sub-menu of the same menu. */
async function submenuSlugTaken(
  menuId: number,
  slug: string,
  exceptId?: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: submenusTable.id })
    .from(submenusTable)
    .where(
      and(
        eq(submenusTable.menuId, menuId),
        eq(submenusTable.slug, slug),
        exceptId != null ? ne(submenusTable.id, exceptId) : undefined,
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** Loads a menu (id + branchId) for ownership/branch checks, or null. */
async function getMenu(menuId: number) {
  const [menu] = await db
    .select({ id: menusTable.id, branchId: menusTable.branchId })
    .from(menusTable)
    .where(eq(menusTable.id, menuId))
    .limit(1);
  return menu ?? null;
}

/**
 * GET /api/v1/submenu — list sub-menus (paginated).
 *
 * - Branch admin: pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 * - Any caller may narrow to one menu with `?menuId=`.
 */
submenuRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", submenuListQuerySchema),
  async (c) => {
    const admin = c.get("admin") as TTokenPayload | undefined;
    const { page, pageSize, branchName, search, menuId } = c.req.valid("query");

    let branchId: number | null | undefined;
    if (admin && !isSuperAdmin(admin)) {
      branchId = admin.branchId!;
    } else if (branchName) {
      branchId = await branchIdByName(branchName);
      if (branchId === null) {
        return ok(
          c,
          "Sub-menus fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    const where = and(
      branchId != null ? eq(submenusTable.branchId, branchId) : undefined,
      menuId != null ? eq(submenusTable.menuId, menuId) : undefined,
      search
        ? or(
            ilike(submenusTable.titleBn, `%${search}%`),
            ilike(submenusTable.titleEn, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(submenusTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(submenusTable)
      .where(where)
      .orderBy(submenusTable.order, submenusTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Sub-menus fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/submenu/:id — public. */
submenuRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [submenu] = await db
      .select()
      .from(submenusTable)
      .where(eq(submenusTable.id, id))
      .limit(1);

    if (!submenu) {
      return notFound(c, "Sub-menu not found");
    }
    if (admin && !canAccessBranch(admin, submenu.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Sub-menu fetched successfully", submenu);
  },
);

/**
 * POST /api/v1/submenu — creates the sub-menu and its (blank, unpublished)
 * page. The page's banner title defaults to the sub-menu title so the editor
 * always has a page to load and publish.
 */
submenuRouter.post(
  "/",
  authMiddleware(),
  zValidator("json", createSubmenuSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("json");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }

    const menu = await getMenu(data.menuId);
    if (!menu) {
      return notFound(c, "Menu not found");
    }
    // The sub-menu must live in the same branch as its parent menu.
    if (menu.branchId !== branchId) {
      return badRequest(c, "Menu does not belong to the target branch");
    }

    const titleBn = emptyToNull(data.titleBn);
    const titleEn = emptyToNull(data.titleEn);
    const slug = await uniqueSlug(slugSource(titleEn, titleBn), (s) =>
      submenuSlugTaken(data.menuId, s),
    );

    const [submenu] = await db
      .insert(submenusTable)
      .values({
        titleBn,
        titleEn,
        slug,
        order: data.order ?? 0,
        menuId: data.menuId,
        branchId,
      })
      .returning({ id: submenusTable.id });

    // The page's banner title defaults to the sub-menu title (both languages).
    await db.insert(pagesTable).values({
      bannerTitleBn: titleBn,
      bannerTitleEn: titleEn,
      submenuId: submenu!.id,
      branchId,
    });

    return created(c, "Sub-menu created successfully");
  },
);

/** PATCH /api/v1/submenu/:id */
submenuRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("json", updateSubmenuSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { branchId, menuId, titleBn, titleEn, ...rest } = c.req.valid("json");

    const [submenu] = await db
      .select()
      .from(submenusTable)
      .where(eq(submenusTable.id, id))
      .limit(1);

    if (!submenu) {
      return notFound(c, "Sub-menu not found");
    }
    if (!canAccessBranch(admin, submenu.branchId)) {
      return forbidden(c);
    }

    // Optionally move to another menu (must belong to the same branch).
    let newMenuId: number | undefined;
    if (menuId !== undefined && menuId !== submenu.menuId) {
      const menu = await getMenu(menuId);
      if (!menu) {
        return notFound(c, "Menu not found");
      }
      if (menu.branchId !== submenu.branchId) {
        return badRequest(c, "Menu does not belong to this branch");
      }
      newMenuId = menuId;
    }

    const newTitleBn =
      titleBn !== undefined ? emptyToNull(titleBn) : submenu.titleBn;
    const newTitleEn =
      titleEn !== undefined ? emptyToNull(titleEn) : submenu.titleEn;
    if (!newTitleBn && !newTitleEn) {
      return badRequest(c, "Provide a title in Bangla or English");
    }
    const titleChanged =
      newTitleBn !== submenu.titleBn || newTitleEn !== submenu.titleEn;

    const targetMenuId = newMenuId ?? submenu.menuId;
    // Re-slug on title change or menu move (uniqueness is per menu).
    const slug =
      titleChanged || newMenuId !== undefined
        ? await uniqueSlug(slugSource(newTitleEn, newTitleBn), (s) =>
            submenuSlugTaken(targetMenuId, s, id),
          )
        : undefined;

    const updates = {
      ...rest,
      ...(titleBn !== undefined && { titleBn: newTitleBn }),
      ...(titleEn !== undefined && { titleEn: newTitleEn }),
      ...(slug !== undefined && { slug }),
      ...(newMenuId !== undefined && { menuId: newMenuId }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(submenusTable).set(updates).where(eq(submenusTable.id, id));

    return ok(c, "Sub-menu updated successfully");
  },
);

/**
 * DELETE /api/v1/submenu/:id — cascades to its page, then removes the page's
 * Cloudinary images (banner + any embedded in the markdown content).
 */
submenuRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [submenu] = await db
      .select()
      .from(submenusTable)
      .where(eq(submenusTable.id, id))
      .limit(1);

    if (!submenu) {
      return notFound(c, "Sub-menu not found");
    }
    if (!canAccessBranch(c.get("admin"), submenu.branchId)) {
      return forbidden(c);
    }

    // Snapshot the page's image references before the cascade removes the row.
    const [page] = await db
      .select({
        bannerImage: pagesTable.bannerImage,
        contentBn: pagesTable.contentBn,
        contentEn: pagesTable.contentEn,
      })
      .from(pagesTable)
      .where(eq(pagesTable.submenuId, id))
      .limit(1);

    await db.delete(submenusTable).where(eq(submenusTable.id, id));

    if (page) {
      await deletePageImages([page]);
    }

    return ok(c, "Sub-menu deleted successfully");
  },
);

export default submenuRouter;
