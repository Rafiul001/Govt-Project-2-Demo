import db from "@/server/db/client";
import { menusTable } from "@/server/db/schemas";
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
import { uniqueSlug } from "@/server/utils/slug";
import { emptyToNull, slugSource } from "@/server/utils/text";
import type { TTokenPayload } from "@/shared/types";
import {
  createMenuSchema,
  updateMenuSchema,
} from "@/shared/validators/menu.validator";
import { branchListQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { Hono } from "hono";

const menuRouter = new Hono<TAppEnv>();

/** Whether `slug` is already used by another menu of the branch. */
async function menuSlugTaken(
  branchId: number,
  slug: string,
  exceptId?: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: menusTable.id })
    .from(menusTable)
    .where(
      and(
        eq(menusTable.branchId, branchId),
        eq(menusTable.slug, slug),
        exceptId != null ? ne(menusTable.id, exceptId) : undefined,
      ),
    )
    .limit(1);
  return Boolean(row);
}

/**
 * GET /api/v1/menu — list menus (paginated).
 *
 * - Branch admin: pinned to their own branch.
 * - Super admin / public: optionally scoped by `?branchName=`.
 */
menuRouter.get(
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
          "Menus fetched successfully",
          paginated([], 0, page, pageSize),
        );
      }
    }

    const where = and(
      branchId != null ? eq(menusTable.branchId, branchId) : undefined,
      search
        ? or(
            ilike(menusTable.titleBn, `%${search}%`),
            ilike(menusTable.titleEn, `%${search}%`),
          )
        : undefined,
    );

    const totalResult = await db
      .select({ value: count() })
      .from(menusTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(menusTable)
      .where(where)
      .orderBy(menusTable.order, menusTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Menus fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/menu/:id — public. */
menuRouter.get(
  "/:id",
  optionalAuthMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin") as TTokenPayload | undefined;

    const [menu] = await db
      .select()
      .from(menusTable)
      .where(eq(menusTable.id, id))
      .limit(1);

    if (!menu) {
      return notFound(c, "Menu not found");
    }
    if (admin && !canAccessBranch(admin, menu.branchId)) {
      return forbidden(c);
    }

    return ok(c, "Menu fetched successfully", menu);
  },
);

/** POST /api/v1/menu */
menuRouter.post(
  "/",
  authMiddleware(),
  zValidator("json", createMenuSchema),
  async (c) => {
    const admin = c.get("admin");
    const data = c.req.valid("json");

    const branchId = resolveBranchId(admin, data.branchId);
    if (branchId === null) {
      return badRequest(c, "branchId is required");
    }
    if (!(await branchExists(branchId))) {
      return notFound(c, "Branch not found");
    }

    const titleBn = emptyToNull(data.titleBn);
    const titleEn = emptyToNull(data.titleEn);
    const slug = await uniqueSlug(slugSource(titleEn, titleBn), (s) =>
      menuSlugTaken(branchId, s),
    );

    await db.insert(menusTable).values({
      titleBn,
      titleEn,
      slug,
      order: data.order ?? 0,
      branchId,
    });

    return created(c, "Menu created successfully");
  },
);

/** PATCH /api/v1/menu/:id */
menuRouter.patch(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  zValidator("json", updateMenuSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const admin = c.get("admin");
    const { branchId, titleBn, titleEn, ...rest } = c.req.valid("json");

    const [menu] = await db
      .select()
      .from(menusTable)
      .where(eq(menusTable.id, id))
      .limit(1);

    if (!menu) {
      return notFound(c, "Menu not found");
    }
    if (!canAccessBranch(admin, menu.branchId)) {
      return forbidden(c);
    }

    // Only super admins may move the menu to another branch.
    const newBranchId = resolveBranchUpdate(admin, branchId);
    if (newBranchId !== undefined && !(await branchExists(newBranchId))) {
      return notFound(c, "Branch not found");
    }

    // Resolve the final bilingual title (provided value wins, else keep
    // existing) so we can re-slug and guarantee at least one language remains.
    const newTitleBn =
      titleBn !== undefined ? emptyToNull(titleBn) : menu.titleBn;
    const newTitleEn =
      titleEn !== undefined ? emptyToNull(titleEn) : menu.titleEn;
    if (!newTitleBn && !newTitleEn) {
      return badRequest(c, "Provide a title in Bangla or English");
    }
    const titleChanged =
      newTitleBn !== menu.titleBn || newTitleEn !== menu.titleEn;

    const targetBranchId = newBranchId ?? menu.branchId;
    // Re-slug when the title changes (or the branch moves, since uniqueness is
    // per branch); keeps the URL in sync and avoids a unique-constraint 500.
    const slug =
      titleChanged || newBranchId !== undefined
        ? await uniqueSlug(slugSource(newTitleEn, newTitleBn), (s) =>
            menuSlugTaken(targetBranchId, s, id),
          )
        : undefined;

    const updates = {
      ...rest,
      ...(titleBn !== undefined && { titleBn: newTitleBn }),
      ...(titleEn !== undefined && { titleEn: newTitleEn }),
      ...(slug !== undefined && { slug }),
      ...(newBranchId !== undefined && { branchId: newBranchId }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db.update(menusTable).set(updates).where(eq(menusTable.id, id));

    return ok(c, "Menu updated successfully");
  },
);

/** DELETE /api/v1/menu/:id — cascades to its sub-menus and their pages. */
menuRouter.delete(
  "/:id",
  authMiddleware(),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [menu] = await db
      .select()
      .from(menusTable)
      .where(eq(menusTable.id, id))
      .limit(1);

    if (!menu) {
      return notFound(c, "Menu not found");
    }
    if (!canAccessBranch(c.get("admin"), menu.branchId)) {
      return forbidden(c);
    }

    await db.delete(menusTable).where(eq(menusTable.id, id));
    return ok(c, "Menu deleted successfully");
  },
);

export default menuRouter;
