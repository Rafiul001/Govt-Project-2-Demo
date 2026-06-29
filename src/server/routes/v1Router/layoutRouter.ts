import db from "@/server/db/client";
import { layoutsTable } from "@/server/db/schemas";
import { authMiddleware } from "@/server/middleware/authMiddleware";
import {
  badRequest,
  conflict,
  created,
  forbidden,
  notFound,
  ok,
} from "@/server/responses";
import type { TAppEnv } from "@/server/types";
import {
  branchExists,
  canAccessBranch,
  isSuperAdmin,
  resolveBranchId,
} from "@/server/utils/scope";
import { paginated, pageOffset } from "@/server/utils/pagination";
import {
  createLayoutSchema,
  updateLayoutSchema,
} from "@/shared/validators/layout.validator";
import { paginationQuerySchema } from "@/shared/validators/pagination.validator";
import { idParamSchema } from "@/shared/validators/params.validator";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { Hono } from "hono";

const layoutRouter = new Hono<TAppEnv>();

// A branch has exactly one layout (unique branchId).
layoutRouter.use(authMiddleware());

/** GET /api/v1/layout — list layouts (branch-scoped, paginated). */
layoutRouter.get(
  "/",
  zValidator("query", paginationQuerySchema),
  async (c) => {
    const admin = c.get("admin");
    const { page, pageSize } = c.req.valid("query");

    const where = isSuperAdmin(admin)
      ? undefined
      : eq(layoutsTable.branchId, admin.branchId!);

    const totalResult = await db
      .select({ value: count() })
      .from(layoutsTable)
      .where(where);
    const total = totalResult[0]?.value ?? 0;

    const items = await db
      .select()
      .from(layoutsTable)
      .where(where)
      .orderBy(layoutsTable.id)
      .limit(pageSize)
      .offset(pageOffset(page, pageSize));

    return ok(
      c,
      "Layouts fetched successfully",
      paginated(items, total, page, pageSize),
    );
  },
);

/** GET /api/v1/layout/:id */
layoutRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [layout] = await db
    .select()
    .from(layoutsTable)
    .where(eq(layoutsTable.id, id))
    .limit(1);

  if (!layout) {
    return notFound(c, "Layout not found");
  }
  if (!canAccessBranch(c.get("admin"), layout.branchId)) {
    return forbidden(c);
  }

  return ok(c, "Layout fetched successfully", layout);
});

/** POST /api/v1/layout */
layoutRouter.post("/", zValidator("json", createLayoutSchema), async (c) => {
  const admin = c.get("admin");
  const data = c.req.valid("json");

  const branchId = resolveBranchId(admin, data.branchId);
  if (branchId === null) {
    return badRequest(c, "branchId is required");
  }
  if (!(await branchExists(branchId))) {
    return notFound(c, "Branch not found");
  }

  const [existing] = await db
    .select({ id: layoutsTable.id })
    .from(layoutsTable)
    .where(eq(layoutsTable.branchId, branchId))
    .limit(1);

  if (existing) {
    return conflict(c, "This branch already has a layout");
  }

  await db.insert(layoutsTable).values({
    showLogo: data.showLogo,
    showBanner: data.showBanner,
    sidebarPosition: data.sidebarPosition,
    branchId,
  });

  return created(c, "Layout created successfully");
});

/** PATCH /api/v1/layout/:id */
layoutRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateLayoutSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    if (Object.keys(data).length === 0) {
      return badRequest(c, "No fields to update");
    }

    const [layout] = await db
      .select()
      .from(layoutsTable)
      .where(eq(layoutsTable.id, id))
      .limit(1);

    if (!layout) {
      return notFound(c, "Layout not found");
    }
    if (!canAccessBranch(c.get("admin"), layout.branchId)) {
      return forbidden(c);
    }

    await db
      .update(layoutsTable)
      .set(data)
      .where(eq(layoutsTable.id, id))
      .returning();

    return ok(c, "Layout updated successfully");
  },
);

/** DELETE /api/v1/layout/:id */
layoutRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [layout] = await db
    .select()
    .from(layoutsTable)
    .where(eq(layoutsTable.id, id))
    .limit(1);

  if (!layout) {
    return notFound(c, "Layout not found");
  }
  if (!canAccessBranch(c.get("admin"), layout.branchId)) {
    return forbidden(c);
  }

  await db.delete(layoutsTable).where(eq(layoutsTable.id, id));
  return ok(c, "Layout deleted successfully");
});

export default layoutRouter;
