import db from "@/server/db/client";
import { memberCategoriesTable, membersTable } from "@/server/db/schemas";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/server/middleware/authMiddleware";
import { badRequest, conflict, created, notFound, ok } from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import { pageOffset, paginated } from "@/server/utils/pagination";
import { adminType } from "@/shared/types";
import {
  createMemberCategorySchema,
  updateMemberCategorySchema,
} from "@/shared/validators/memberCategory.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { and, count, eq, ne } from "drizzle-orm";
import { Hono } from "hono";

const memberCategoryRouter = new Hono<TAppEnv>();

// Member categories are GLOBAL (shared by every branch): reads are public
// (the landing sites build their nav from them); mutations are super-admin
// only, so new kinds of people can be added without a code change.

/** Whether `slug` is already used by another category. */
async function slugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: memberCategoriesTable.id })
    .from(memberCategoriesTable)
    .where(
      and(
        eq(memberCategoriesTable.slug, slug),
        excludeId !== undefined
          ? ne(memberCategoriesTable.id, excludeId)
          : undefined,
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** GET /api/v1/member-category — list (paginated), public. */
memberCategoryRouter.get(
  "/",
  optionalAuthMiddleware(),
  zValidator("query", paginationQuerySchema),
  async (c) => {
    const { page, pageSize } = c.req.valid("query");

    const totalResult = await db
      .select({ value: count() })
      .from(memberCategoriesTable);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(memberCategoriesTable)
      .orderBy(memberCategoriesTable.order, memberCategoriesTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Member categories fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/member-category/:id — public. */
memberCategoryRouter.get(
  "/:id",
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [category] = await db
      .select()
      .from(memberCategoriesTable)
      .where(eq(memberCategoriesTable.id, id))
      .limit(1);

    if (!category) {
      return notFound(c, "Member category not found");
    }
    return ok(c, "Member category fetched successfully", category);
  },
);

/** POST /api/v1/member-category — super admin only. */
memberCategoryRouter.post(
  "/",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("json", createMemberCategorySchema),
  async (c) => {
    const data = c.req.valid("json");

    if (await slugTaken(data.slug)) {
      return conflict(c, "A category with this slug already exists");
    }

    await db.insert(memberCategoriesTable).values({
      nameBn: data.nameBn || null,
      nameEn: data.nameEn || null,
      slug: data.slug,
      order: data.order,
    });

    return created(c, "Member category created successfully");
  },
);

/** PATCH /api/v1/member-category/:id — super admin only. */
memberCategoryRouter.patch(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  zValidator("json", updateMemberCategorySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const [category] = await db
      .select()
      .from(memberCategoriesTable)
      .where(eq(memberCategoriesTable.id, id))
      .limit(1);

    if (!category) {
      return notFound(c, "Member category not found");
    }

    if (data.slug && (await slugTaken(data.slug, id))) {
      return conflict(c, "A category with this slug already exists");
    }

    // A name may be cleared (empty string → null) but never both at once.
    const nameBn = data.nameBn !== undefined ? data.nameBn || null : undefined;
    const nameEn = data.nameEn !== undefined ? data.nameEn || null : undefined;
    if ((nameBn ?? category.nameBn) === null && (nameEn ?? category.nameEn) === null) {
      return badRequest(c, "Provide a name in Bangla or English");
    }

    const updates = {
      ...(nameBn !== undefined && { nameBn }),
      ...(nameEn !== undefined && { nameEn }),
      ...(data.slug && { slug: data.slug }),
      ...(data.order !== undefined && { order: data.order }),
    };
    if (Object.keys(updates).length === 0) {
      return badRequest(c, "No fields to update");
    }

    await db
      .update(memberCategoriesTable)
      .set(updates)
      .where(eq(memberCategoriesTable.id, id));

    return ok(c, "Member category updated successfully");
  },
);

/** DELETE /api/v1/member-category/:id — super admin only. */
memberCategoryRouter.delete(
  "/:id",
  authMiddleware([adminType.SUPER_ADMIN]),
  zValidator("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const [category] = await db
      .select()
      .from(memberCategoriesTable)
      .where(eq(memberCategoriesTable.id, id))
      .limit(1);

    if (!category) {
      return notFound(c, "Member category not found");
    }

    // A cascade here would silently wipe member profiles across ALL branches
    // (categories are global), so refuse to delete a non-empty category.
    const memberCount = await db
      .select({ value: count() })
      .from(membersTable)
      .where(eq(membersTable.categoryId, id));
    if ((memberCount[0]?.value ?? 0) > 0) {
      return badRequest(
        c,
        "Category still has members; move or delete them first",
      );
    }

    await db
      .delete(memberCategoriesTable)
      .where(eq(memberCategoriesTable.id, id));
    return ok(c, "Member category deleted successfully");
  },
);

export default memberCategoryRouter;
